/*
 * Wazuh app - Module for Overview/FIM visualizations
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
export default [
  {
    _id: 'Wazuh-App-Overview-FIM-Events-summary',
    _type: 'visualization',
    _source: {
      title: 'Events summary',
      visState:
        '{"title":"Events summary","type":"line","params":{"type":"line","grid":{"categoryLines":true,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Alerts"}}],"seriesParams":[{"show":"true","type":"line","mode":"normal","data":{"label":"Alerts","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Alerts"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-FIM-Top-5-rules',
    _type: 'visualization',
    _source: {
      title: 'Top 5 rules',
      visState:
        '{"title":"Export rule distr","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"sum","schema":"metric","params":{"field":"rule.level"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"rule.description","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-FIM-Top-5-agents-pie',
    _type: 'visualization',
    _source: {
      title: 'Top 5 agents pie',
      visState:
        '{"title":"Top 5 agents pie","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"agent.name","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"language":"lucene","query":""},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-FIM-Common-actions',
    _type: 'visualization',
    _source: {
      title: 'Common actions',
      visState:
        '{"title":"Common actions","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":false,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"syscheck.event","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"language":"lucene","query":""},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Agents-FIM-Alerts-by-action-over-time',
    _source: {
      title: 'Alerts by action over time',
      visState:
        '{"title":"Alerts by action over time","type":"area","params":{"type":"area","grid":{"categoryLines":true,"style":{"color":"#eee"},"valueAxis":"ValueAxis-1"},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"area","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"cardinal","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"left","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","timeRange":{"from":"now-24h","to":"now","mode":"quick"},"useNormalizedEsInterval":true,"interval":"auto","time_zone":"Europe/Berlin","drop_partials":false,"customInterval":"2h","min_doc_count":1,"extended_bounds":{}}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"syscheck.event","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON: `{ "index":"wazuh-alerts", "filter":[], "query":{"query":"","language":"lucene"} }`
      }
    },
    _type: 'visualization'
  },
  {
    _id: 'Wazuh-App-Overview-FIM-top-agents-user',
    _type: 'visualization',
    _source: {
      title: 'Top users',
      visState:
        '{"title":"Top users","type":"table","params":{"perPage":5,"showPartialRows":false,"showMetricsAtAllLevels":false,"sort":{"columnIndex":3,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"agent.id","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Agent ID"}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"agent.name","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Agent name"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"syscheck.uname_after","size":1,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Top user"}}]}',
      uiStateJSON:
        '{"vis":{"params":{"sort":{"columnIndex":3,"direction":"desc"}}}}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[{"meta":{"index":"wazuh-alerts","negate":false,"disabled":false,"alias":null,"type":"phrase","key":"rule.groups","value":"syscheck","params":{"query":"syscheck","type":"phrase"}},"query":{"match":{"rule.groups":{"query":"syscheck","type":"phrase"}}},"$state":{"store":"appState"}}]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-FIM-Alerts-summary',
    _type: 'visualization',
    _source: {
      title: 'Alerts summary',
      visState:
        '{"title":"Alerts summary","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":3,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"agent.name","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":50,"order":"desc","orderBy":"1","customLabel":"Agent"}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"syscheck.path","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":20,"order":"desc","orderBy":"1","customLabel":"Path"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"syscheck.event","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":12,"order":"desc","orderBy":"1","customLabel":"Action"}}]}',
      uiStateJSON:
        '{"vis":{"params":{"sort":{"columnIndex":3,"direction":"desc"}}}}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
      }
    }
  }
];
