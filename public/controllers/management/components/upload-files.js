/*
 * Wazuh app - React component for building the reports table.
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
import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexItem,
  EuiFilePicker,
  EuiButton,
  EuiButtonEmpty,
  EuiListGroupItem,
  EuiCallOut,
  EuiListGroup,
  EuiTitle,
  EuiButtonIcon,
  EuiText,
  EuiIcon,
  EuiSpacer,
  EuiPopover
} from '@elastic/eui';

export class UploadFiles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: {},
      isPopoverOpen: false,
      uploadErrors: false,
      errorPopover: false
    };
    this.maxSize = 307200; // 300Kb
  }

  onChange = files => {
    this.setState({
      files: files
    });
  };

  onButtonClick() {
    this.setState({
      isPopoverOpen: !this.state.isPopoverOpen,
      files: {}
    });
  }

  closePopover() {
    this.setState({
      errorPopover: false,
      isPopoverOpen: false,
      files: {},
      uploadErrors: false
    });
  }

  /**
   * Creates an array of objects with the files names and their content
   */
  async startUpload() {
    try {
      const files = [];
      for (let idx = 0; idx < this.state.files.length; idx++) {
        const reader = new FileReader();
        const file = this.state.files[idx];
        reader.readAsText(file);
        // This interval is for wait until the FileReader has read the file content
        const interval = setInterval(async () => {
          if (reader.readyState === 2) {
            files.push({
              file: file.name,
              content: reader.result
            });
            clearInterval(interval);
            if (files.length === this.state.files.length) {
              try {
                await this.props.upload(files, this.props.path);
                this.closePopover();
              } catch (error) {
                this.setState({ uploadErrors: error });
              }
            }
          }
        }, 100);
      }
    } catch (error) { }
  }

  /**
   * Renders a CallOut with a warning
   * @param {String} title
   */
  renderWarning(title) {
    return (
      <EuiCallOut size="s" title={title} color="warning" iconType="iInCircle" />
    );
  }

   /**
   * Renders the result of a file upload
   */
  renderResult(result){
    return (
      <Fragment>
        {!result.uploaded && <EuiCallOut size="s" title={result.file} color="danger" iconType="alert">
        <EuiText 
          className='list-element-bad'
          size='s'
        >{result.error}
        </EuiText>  
      </EuiCallOut> 
        || 
      <EuiText 
        className='list-element-ok'
        size='s'
        >
        <EuiIcon type={'check'} /> 
         {result.file} was uploaded successfully.
      </EuiText> 
      }
    </Fragment>
    );
  }



  /**
   * Checks the size of the files in order to check if anyone is bigger that the size allowed
   */
  checkOverSize() {
    const result = Object.keys(this.state.files).filter(item => {
      return this.state.files[item].size > this.maxSize;
    });
    return result.length;
  }

  /**
   * Validates the files extension
   */
  checkValidFileExtensions() {
    const path = this.props.path;
    if (path.includes('etc/rules') || path.includes('etc/decoders')) {
      const result = Object.keys(this.state.files).filter(item => {
        const file = this.state.files[item].name;
        return file.substr(file.length - 4) !== '.xml';
      });
      return result.length ? false : true;
    }
    return true;
  }

  /**
   * Renders a list with the attached files
   */
  renderFiles() {
    return (
      <Fragment>
        <EuiListGroup flush={true} className="list-of-files">
          {Object.keys(this.state.files).map(index => (
            <EuiListGroupItem
              id={index}
              key={index}
              label={`${this.state.files[index].name} (${this.state.files[index].size} Bytes)`}
              isActive
            />
          ))}
        </EuiListGroup>
      </Fragment>
    );
  }


  /**
   * Renders the errors when trying to upload files
   */
  renderErrors() {
    return (
      <Fragment>
        <EuiListGroup flush={true} className="list-of-files-fail">
          {this.state.uploadErrors.map((error, idx) => { // We firs show the files that were successfully uploaded
            if(error.uploaded){
              return (
                <EuiFlexItem
                  key={idx}
                  id={error.index}>
                  {this.renderResult(error)}
                  <EuiSpacer size="s" />
                </EuiFlexItem>
              )
            }
          })
          }
          {this.state.uploadErrors.map((error, idx) => { 
            if(!error.uploaded){ // When all successfully uploaded files are shown, then we show the failed files
            return (
              <EuiFlexItem
                key={idx}
                id={error.index}>
                {this.renderResult(error)}
                <EuiSpacer size="s" />
              </EuiFlexItem>
            )
          }
          })
          }
        </EuiListGroup>
      </Fragment>
    );
  }

  render() {
    const button = (
      <EuiButtonEmpty
        iconType="importAction"
        iconSide="left"
        onClick={() => this.onButtonClick()}
      >
        Import files
      </EuiButtonEmpty>
    );
    return (
      <EuiPopover
        id="popover"
        button={button}
        isOpen={this.state.isPopoverOpen}
        anchorPosition="downRight"
        closePopover={() => this.closePopover()}
      >
        <div style={{ width: '300px' }}>
          <EuiTitle size="m">
            <h1>{`Upload ${this.props.msg}`}</h1>
          </EuiTitle>
          <EuiFlexItem>{!this.state.uploadErrors &&
            <EuiFilePicker
              id="filePicker"
              multiple
              compressed={false}
              initialPromptText={`Select or drag and drop your ${this.props.msg} files here`}
              className="no-max-width"
              onChange={files => {
                this.onChange(files);
              }}
            />
          }</EuiFlexItem>

          {this.state.files.length > 0 &&
            this.state.files.length < 6 &&
            !this.checkOverSize() > 0 &&
            this.checkValidFileExtensions() > 0 && (
              <Fragment>
                <EuiFlexItem>{!this.state.uploadErrors &&
                  this.renderFiles() ||
                  this.renderErrors()
                }</EuiFlexItem>
                <EuiFlexItem grow={false}>{!this.state.uploadErrors &&
                  <EuiButton
                    className="upload-files-button"
                    fill
                    iconType="sortUp"
                    onClick={() => this.startUpload()}
                  >
                    Upload
                  </EuiButton>
                  ||
                  <EuiButtonEmpty
                    className="upload-files-button"
                    onClick={() => this.closePopover()}
                  >
                    Close
                </EuiButtonEmpty>
                }</EuiFlexItem>
              </Fragment>
            )}

          {this.state.files.length > 5 && (
            <Fragment>
              {this.renderWarning(
                'The max number of concurrent files uploads is 5.'
              )}
            </Fragment>
          )}

          {this.checkOverSize() > 0 && (
            <Fragment>
              {this.renderWarning(
                `The max size per file allowd is ${this.maxSize / 1024} Kb`
              )}
            </Fragment>
          )}

          {!this.checkValidFileExtensions() > 0 && (
            <Fragment>
              {this.renderWarning('The files extensions are not valid.')}
            </Fragment>
          )}
        </div>
      </EuiPopover>
    );
  }
}

UploadFiles.propTypes = {
  msg: PropTypes.string,
  path: PropTypes.string,
  upload: PropTypes.func
};
