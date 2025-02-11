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

import { EuiContextMenu, EuiPopover } from '@elastic/eui';
import {
  Filter,
  isFilterPinned,
  toggleFilterDisabled,
  toggleFilterNegated,
  toggleFilterPinned,
} from '@kbn/es-query';
import { InjectedIntl, injectI18n } from '@kbn/i18n/react';
import classNames from 'classnames';
import React, { Component } from 'react';
import { IndexPattern } from 'ui/index_patterns';
import { FilterEditor } from 'plugins/data/filter/filter_bar/filter_editor';
import { FilterView } from './filter_view';

interface Props {
  id: string;
  filter: Filter;
  indexPatterns: IndexPattern[];
  className?: string;
  onUpdate: (filter: Filter) => void;
  onRemove: () => void;
  intl: InjectedIntl;
}

interface State {
  isPopoverOpen: boolean;
}

class FilterItemUI extends Component<Props, State> {
  public state = {
    isPopoverOpen: false,
  };

  public render() {
    const { filter, id } = this.props;
    const { negate, disabled } = filter.meta;

    const classes = classNames(
      'globalFilterItem',
      {
        'globalFilterItem-isDisabled': disabled,
        'globalFilterItem-isPinned': isFilterPinned(filter),
        'globalFilterItem-isExcluded': negate,
      },
      this.props.className
    );

    const dataTestSubjKey = filter.meta.key ? `filter-key-${filter.meta.key}` : '';
    const dataTestSubjValue = filter.meta.value ? `filter-value-${filter.meta.value}` : '';
    const dataTestSubjDisabled = `filter-${
      this.props.filter.meta.disabled ? 'disabled' : 'enabled'
      }`;

    const badge = (
      <FilterView
        filter={filter}
        className={classes}
        iconOnClick={() => this.props.onRemove()}
        onClick={this.togglePopover}
        data-test-subj={`filter ${dataTestSubjDisabled} ${dataTestSubjKey} ${dataTestSubjValue}`}
      />
    );

    const panelTree = [
      {
        id: 0,
        items: [
          {
            name: isFilterPinned(filter)
              ? this.props.intl.formatMessage({
                id: 'common.ui.filterBar.unpinFilterButtonLabel',
                defaultMessage: 'Unpin',
              })
              : this.props.intl.formatMessage({
                id: 'common.ui.filterBar.pinFilterButtonLabel',
                defaultMessage: 'Pin across all apps',
              }),
            icon: 'pin',
            onClick: () => {
              this.closePopover();
              this.onTogglePinned();
            },
            'data-test-subj': 'pinFilter',
          },
          {
            name: this.props.intl.formatMessage({
              id: 'common.ui.filterBar.editFilterButtonLabel',
              defaultMessage: 'Edit filter',
            }),
            icon: 'pencil',
            panel: 1,
            'data-test-subj': 'editFilter',
          },
          {
            name: negate
              ? this.props.intl.formatMessage({
                id: 'common.ui.filterBar.includeFilterButtonLabel',
                defaultMessage: 'Include results',
              })
              : this.props.intl.formatMessage({
                id: 'common.ui.filterBar.excludeFilterButtonLabel',
                defaultMessage: 'Exclude results',
              }),
            icon: negate ? 'plusInCircle' : 'minusInCircle',
            onClick: () => {
              this.closePopover();
              this.onToggleNegated();
            },
            'data-test-subj': 'negateFilter',
          },
          {
            name: disabled
              ? this.props.intl.formatMessage({
                id: 'common.ui.filterBar.enableFilterButtonLabel',
                defaultMessage: 'Re-enable',
              })
              : this.props.intl.formatMessage({
                id: 'common.ui.filterBar.disableFilterButtonLabel',
                defaultMessage: 'Temporarily disable',
              }),
            icon: `${disabled ? 'eye' : 'eyeClosed'}`,
            onClick: () => {
              this.closePopover();
              this.onToggleDisabled();
            },
            'data-test-subj': 'disableFilter',
          },
          {
            name: this.props.intl.formatMessage({
              id: 'common.ui.filterBar.deleteFilterButtonLabel',
              defaultMessage: 'Delete',
            }),
            icon: 'trash',
            onClick: () => {
              this.closePopover();
              this.props.onRemove();
            },
            'data-test-subj': 'deleteFilter',
          },
        ],
      },
      {
        id: 1,
        width: 400,
        content: (
          <div>
            <FilterEditor
              filter={filter}
              indexPatterns={this.props.indexPatterns}
              onSubmit={this.onSubmit}
              onCancel={this.closePopover}
            />
          </div>
        ),
      },
    ];

    return (
      <EuiPopover
        id={`popoverFor_filter${id}`}
        isOpen={this.state.isPopoverOpen}
        closePopover={this.closePopover}
        button={badge}
        anchorPosition="downLeft"
        withTitle={true}
        panelPaddingSize="none"
      >
        <EuiContextMenu initialPanelId={0} panels={panelTree} />
      </EuiPopover>
    );
  }

  private closePopover = () => {
    this.setState({
      isPopoverOpen: false,
    });
  };

  private togglePopover = () => {
    this.setState({
      isPopoverOpen: !this.state.isPopoverOpen,
    });
  };

  private onSubmit = (filter: Filter) => {
    this.closePopover();
    this.props.onUpdate(filter);
  };

  private onTogglePinned = () => {
    const filter = toggleFilterPinned(this.props.filter);
    this.props.onUpdate(filter);
  };

  private onToggleNegated = () => {
    const filter = toggleFilterNegated(this.props.filter);
    this.props.onUpdate(filter);
  };

  private onToggleDisabled = () => {
    const filter = toggleFilterDisabled(this.props.filter);
    this.props.onUpdate(filter);
  };
}

export const FilterItem = injectI18n(FilterItemUI);
