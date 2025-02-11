/*
 * Author: Elasticsearch B.V.
 * Updated by Wazuh, Inc.
 *
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import { Filter, isFilterPinned, FilterStateStore } from '@kbn/es-query';

import _ from 'lodash';
import { Subject } from 'rxjs';

import { npSetup } from 'ui/new_platform';

// @ts-ignore
import { compareFilters } from 'plugins/data/filter/filter_manager/lib/compare_filters';
// @ts-ignore
import { mapAndFlattenFilters } from 'plugins/data/filter/filter_manager/lib/map_and_flatten_filters';
// @ts-ignore
import { uniqFilters } from 'plugins/data/filter/filter_manager/lib/uniq_filters';
// @ts-ignore
import { extractTimeFilter } from 'plugins/data/filter/filter_manager/lib/extract_time_filter';
// @ts-ignore
import { changeTimeFilter } from 'plugins/data/filter/filter_manager/lib/change_time_filter';

import { onlyDisabledFiltersChanged } from './only_disabled';

import { PartitionedFilters } from 'plugins/data/filter/filter_manager/partitioned_filters';

import { IndexPatterns } from 'plugins/data/index_patterns';

export class FilterManager {
  private indexPatterns: IndexPatterns;
  private filters: Filter[] = [];
  private updated$: Subject<void> = new Subject();
  private fetch$: Subject<void> = new Subject();

  constructor(indexPatterns: IndexPatterns) {
    this.indexPatterns = indexPatterns;
  }

  private mergeIncomingFilters(partitionedFilters: PartitionedFilters): Filter[] {
    const globalFilters = partitionedFilters.globalFilters;
    const appFilters = partitionedFilters.appFilters;

    // existing globalFilters should be mutated by appFilters
    _.each(appFilters, function (filter, i) {
      const match = _.find(globalFilters, function (globalFilter) {
        return compareFilters(globalFilter, filter);
      });

      // no match, do nothing
      if (!match) return;

      // matching filter in globalState, update global and remove from appState
      _.assign(match.meta, filter.meta);
      appFilters.splice(i, 1);
    });

    return FilterManager.mergeFilters(appFilters, globalFilters);
  }

  private static mergeFilters(appFilters: Filter[], globalFilters: Filter[]): Filter[] {
    return uniqFilters(appFilters.reverse().concat(globalFilters.reverse())).reverse();
  }

  private static partitionFilters(filters: Filter[]): PartitionedFilters {
    const [globalFilters, appFilters] = _.partition(filters, isFilterPinned);
    return {
      globalFilters,
      appFilters,
    };
  }

  private handleStateUpdate(newFilters: Filter[]) {
    // global filters should always be first
    newFilters.sort(({ $state: a }: Filter, { $state: b }: Filter): number => {
      return a!.store === FilterStateStore.GLOBAL_STATE &&
        b!.store !== FilterStateStore.GLOBAL_STATE
        ? -1
        : 1;
    });

    const filtersUpdated = !_.isEqual(this.filters, newFilters);
    const updatedOnlyDisabledFilters = onlyDisabledFiltersChanged(newFilters, this.filters);

    this.filters = newFilters;
    if (filtersUpdated) {
      this.updated$.next();
      if (!updatedOnlyDisabledFilters) {
        this.fetch$.next();
      }
    }
  }

  /* Getters */

  public getFilters() {
    return _.cloneDeep(this.filters);
  }

  public getAppFilters() {
    const { appFilters } = this.getPartitionedFilters();
    return appFilters;
  }

  public getGlobalFilters() {
    const { globalFilters } = this.getPartitionedFilters();
    return globalFilters;
  }

  public getPartitionedFilters(): PartitionedFilters {
    return FilterManager.partitionFilters(this.getFilters());
  }

  public getUpdates$() {
    return this.updated$.asObservable();
  }

  public getFetches$() {
    return this.fetch$.asObservable();
  }

  /* Setters */

  public async addFilters(filters: Filter[] | Filter, pinFilterStatus?: boolean) {
    if (!Array.isArray(filters)) {
      filters = [filters];
    }

    if (filters.length === 0) {
      return;
    }

    const { uiSettings } = npSetup.core;
    if (pinFilterStatus === undefined) {
      pinFilterStatus = uiSettings.get('filters:pinnedByDefault');
    }

    // Set the store of all filters. For now.
    // In the future, all filters should come in with filter state store already set.
    const store = pinFilterStatus ? FilterStateStore.GLOBAL_STATE : FilterStateStore.APP_STATE;
    FilterManager.setFiltersStore(filters, store);

    const mappedFilters = await mapAndFlattenFilters(this.indexPatterns, filters);

    // This is where we add new filters to the correct place (app \ global)
    const newPartitionedFilters = FilterManager.partitionFilters(mappedFilters);
    const currentFilters = this.getPartitionedFilters();
    currentFilters.appFilters.push(...newPartitionedFilters.appFilters);
    currentFilters.globalFilters.push(...newPartitionedFilters.globalFilters);

    const newFilters = this.mergeIncomingFilters(currentFilters);
    this.handleStateUpdate(newFilters);
  }

  public async setFilters(newFilters: Filter[]) {
    const mappedFilters = await mapAndFlattenFilters(this.indexPatterns, newFilters);
    const newPartitionedFilters = FilterManager.partitionFilters(mappedFilters);
    const mergedFilters = this.mergeIncomingFilters(newPartitionedFilters);
    this.handleStateUpdate(mergedFilters);
  }

  public removeFilter(filter: Filter) {
    const filterIndex = _.findIndex(this.filters, item => {
      return _.isEqual(item.meta, filter.meta) && _.isEqual(item.query, filter.query);
    });

    if (filterIndex >= 0) {
      const newFilters = _.cloneDeep(this.filters);
      newFilters.splice(filterIndex, 1);
      this.handleStateUpdate(newFilters);
    }
  }

  public async removeAll() {
    await this.setFilters([]);
  }

  public async addFiltersAndChangeTimeFilter(filters: Filter[]) {
    const timeFilter = await extractTimeFilter(this.indexPatterns, filters);
    if (timeFilter) changeTimeFilter(timeFilter);
    return this.addFilters(filters.filter(filter => filter !== timeFilter));
  }

  public static setFiltersStore(filters: Filter[], store: FilterStateStore) {
    _.map(filters, (filter: Filter) => {
      // Override status only for filters that didn't have state in the first place.
      if (filter.$state === undefined) {
        filter.$state = { store };
      }
    });
  }
}