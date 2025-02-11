/*
 * Wazuh app - React component for the adding an API entry form.
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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCodeBlock,
  EuiText,
  EuiSpacer,
  EuiCode,
  EuiButton,
  EuiButtonEmpty,
  EuiSteps,
  EuiBasicTable,
  EuiHealth
} from '@elastic/eui';

export class ApiIsDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'incomplete',
      fetchingData: false,
      apiEntries: [],
      refreshingEntries: false
    };
  }


  componentDidMount() {
    this.setState({
      apiEntries: [...this.props.apiEntries]
    });
  }

  /**
   * Checks again the connection in order to know the state of the API entries
   */
  async checkConnection() {
    try {
      let status = 'complete';
      const hosts = await this.props.getHosts();
      this.setState({
        fetchingData: true,
        refreshingEntries: true,
        apiEntries: hosts
      });
      const entries = this.state.apiEntries;
      let numErr = 0;
      for (let idx in entries) {
        const entry = entries[idx];
        try {
          const data = await this.props.testApi(entry);
          const clusterInfo = data.data || {};
          const id = entries[idx].id;;
          entries[idx].status = 'online';
          entries[idx].cluster_info = clusterInfo;
          //Updates the cluster info in the registry
          await this.props.updateClusterInfoInRegistry(id, clusterInfo);
        } catch (error) {
          numErr = numErr + 1;
          const code = ((error || {}).data || {}).code;
          const status = code === 3099 ? 'down' : 'unknown';
          entries[idx].status = status;
        }
      }
      if (numErr) {
        status = numErr >= entries.length ? 'danger' : 'warning';
      }
      this.setState({
        apiEntries: entries,
        fetchingData: false,
        status: status,
        refreshingEntries: false
      });
    } catch (error) {}
  }

  render() {
    const apiExample = `
# Example Wazuh API configuration
hosts:
    - production:
        url: http://172.16.1.2
        port: 55000
        user: foo
        password: bar
`;

    const checkConnectionChildren = (
      <div>
        <EuiText>
          Check that the Kibana server can reach the configured Wazuh API(s).
        </EuiText>
        <EuiSpacer />
        <EuiButton
          onClick={async () => await this.checkConnection()}
          isLoading={this.state.fetchingData}
        >
          Check connection
        </EuiButton>
        {this.state.status !== 'danger' &&
         this.state.status !== 'incomplete' && (
          <EuiButtonEmpty
            onClick={() => this.props.closeApiIsDown()}
          >
          Close
        </EuiButtonEmpty>
        )}
        <EuiSpacer />
        <EuiText>Already configured Wazuh API(s)</EuiText>
        <EuiSpacer />
        <EuiBasicTable
          loading={this.state.refreshingEntries}
          items={this.state.apiEntries}
          columns={[
            { field: 'url', name: 'Host' },
            { field: 'port', name: 'Port' },
            {
              field: 'status',
              name: 'Status',
              render: item => {
                return item === 'online' ? (
                  <EuiHealth color="success">Online</EuiHealth>
                ) : item === 'down' ? (
                  <EuiHealth color="warning">Warning</EuiHealth>
                ) : (
                      <EuiHealth color="danger">Offline</EuiHealth>
                    );
              }
            }
          ]}
        />
      </div>
    );

    const steps = [
      {
        title: 'Check the Wazuh API service status',
        children: (
          <div>
            <EuiText>For Systemd</EuiText>
            <EuiSpacer />
            <EuiCode>$ sudo systemctl status wazuh-api</EuiCode>
            <EuiSpacer />
            <EuiText>For SysV Init</EuiText>
            <EuiSpacer />
            <EuiCode>$ sudo service wazuh-api status</EuiCode>
          </div>
        )
      },
      {
        title: 'Check the configuration',
        children: (
          <div>
            <EuiText>
              Review the settings in the{' '}
              <EuiCode>kibana/plugins/wazuh/wazuh.yml</EuiCode> file.
            </EuiText>
            <EuiSpacer />
            <EuiCodeBlock language="yaml">{apiExample}</EuiCodeBlock>
          </div>
        )
      },
      {
        title: 'Test the configuration',
        children: checkConnectionChildren,
        status: this.state.status
      }
    ];
    return (
      <EuiFlexGroup>
        <EuiFlexItem />
        <EuiFlexItem>
          <EuiText>
            <h2>Wazuh API seems to be down</h2>
          </EuiText>
          <EuiSpacer />
          <EuiSteps firstStepNumber={1} steps={steps} />
        </EuiFlexItem>
        <EuiFlexItem />
      </EuiFlexGroup>
    );
  }
}

ApiIsDown.propTypes = {
  apiEntries: PropTypes.array,
  checkManager: PropTypes.func,
  closeApiIsDown: PropTypes.func,
  updateClusterInfoInRegistry: PropTypes.func,
  getHosts: PropTypes.func
};
