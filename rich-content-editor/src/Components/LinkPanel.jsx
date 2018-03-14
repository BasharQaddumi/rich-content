import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isUndefined from 'lodash/isUndefined';
import { isValidUrl } from '~/Utils/urlValidators';

import Tooltip from '~/Components/Tooltip';
import Checkbox from '~/Components/Checkbox';
import ErrorIcon from './icons/error.svg';
import { mergeStyles } from '~/Utils';
import styles from '~/Styles/link-panel.scss';

class LinkPanel extends Component {
  constructor(props) {
    super(props);
    const { url, targetBlank, nofollow } = props;
    const intermediateUrl = url || '';
    this.state = {
      intermediateUrl,
      url: url || '',
      isValidUrl: true,
      targetBlank: isUndefined(targetBlank) ? true : targetBlank,
      nofollow: isUndefined(nofollow) ? false : nofollow,
    };
    this.styles = mergeStyles({ styles, theme: props.theme });
  }

  componentDidMount() {
    this.input.focus();
  }

  handleIntermediateUrlChange = event => {
    this.setState({ intermediateUrl: event.target.value });
  };

  handleUrlChange = () => {
    const { intermediateUrl } = this.state;
    this.setState({ url: intermediateUrl });
  };

  handleTargetChange = event => {
    this.setState({ targetBlank: event.target.checked });
  };

  handleNofollowChange = event => {
    this.setState({ nofollow: event.target.checked });
  };

  validateUrl = () => {
    const { intermediateUrl } = this.state;
    const isValidUrlConst = isValidUrl(intermediateUrl) || (intermediateUrl === '');
    if (isValidUrlConst) {
      this.handleUrlChange();
    }
    this.setState({ isValidUrl: isValidUrlConst });
  };

  handleKeyPress = e => {
    if (e.charCode === 13) {
      this.validateUrl(e);
    }
  };

  render() {
    const { styles } = this;
    const { isImageSettings, theme, t } = this.props;
    const firstCheckboxText = t('LinkPanel_Target_Checkbox');
    const secondCheckboxText = t('LinkPanel_Nofollow_Checkbox');
    const inputPlaceholder = isImageSettings ? t('LinkPanel_InputPlaceholder_ImageSettings') : t('LinkPanel_InputPlaceholder');
    const errorTooltipText = t('LinkPanel_ErrorTooltip');
    const textInputClassName = classNames(styles.linkPanel_textInput,
      {
        [styles.linkPanel_textInput_invalid]: !this.state.isValidUrl,
        [styles.linkPanel_imageSettings]: isImageSettings
      }
    );
    return (
      <div className={styles.linkPanel_Content}>
        <div onKeyPress={this.handleKeyPress}>
          <div className={styles.linkPanel_Input}>
            <input
              ref={ref => (this.input = ref)}
              className={textInputClassName}
              placeholder={inputPlaceholder}
              onChange={this.handleIntermediateUrlChange}
              onBlur={this.validateUrl}
              value={this.state.intermediateUrl}
            />
            {this.state.isValidUrl ? null : (
              <Tooltip
                content={errorTooltipText}
                moveBy={{ x: -23, y: -5 }}
                theme={theme}
              >
                <span><ErrorIcon className={styles.linkPanel_errorIcon} /></span>
              </Tooltip>
            )}
          </div>
        </div>
        <div>
          <Checkbox label={firstCheckboxText} theme={theme} checked={this.state.targetBlank} onChange={this.handleTargetChange} />
          <Checkbox label={secondCheckboxText} theme={theme} checked={this.state.nofollow} onChange={this.handleNofollowChange} />
        </div>
      </div>
    );
  }
}

LinkPanel.propTypes = {
  url: PropTypes.string,
  targetBlank: PropTypes.bool,
  nofollow: PropTypes.bool,
  isImageSettings: PropTypes.bool,
  theme: PropTypes.object.isRequired,
  t: PropTypes.func,
};
export default LinkPanel;