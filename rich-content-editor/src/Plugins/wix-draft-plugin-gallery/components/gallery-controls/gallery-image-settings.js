import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import findIndex from 'lodash/findIndex';
import { getScaleToFillImageURL } from 'image-client-api/dist/imageClientSDK';
import Image from '~/Components/Image';

import SettingsSection from '~/Components/SettingsSection';
import InputWithLabel from '~/Components/InputWithLabel';
import SettingsPanelFooter from '~/Components/SettingsPanelFooter';
import LinkPanel from '../../../../Components/LinkPanel.jsx';
import FileInput from '~/Components/FileInput';
import BackIcon from './icons/back.svg';

import { mergeStyles } from '~/Utils';
import styles from './gallery-image-settings.scss';
import GallerySettingsMobileHeader from './gallery-settings-mobile-header';

class ImageSettings extends Component {

  constructor(props) {
    super(props);
    this.styles = mergeStyles({ styles, theme: props.theme });
    this.state = this.propsToState(this.props);
  }

  propsToState(props) {
    return {
      selectedIndex: props.selectedImage ?
        findIndex(props.images, i => props.selectedImage.url === i.url) : -1,
      images: props.images
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState(this.propsToState(nextProps));
    }
  }

  componentDidMount() {
    this.initialImageState = this.props.images.map(i => ({ ...i }));
  }

  setLinkPanel = linkPanel => this.linkPanel = linkPanel;

  deleteImage(selectedImage) {
    const images = this.state.images.filter(i => i.url !== selectedImage.url);
    this.setState({
      images,
      selectedIndex: Math.min(this.state.selectedIndex, images.length - 1)
    });
  }

  imageMetadataUpdated = (image, value) => {
    image.metadata = Object.assign({}, image.metadata, value);
    this.setState({ images: this.state.images });
  };

  replaceItem(event) {
    const { handleFileChange } = this.props;
    const itemIdx = this.state.selectedIndex;
    handleFileChange(event, itemIdx);
  }

  onDoneClick = selectedImage => {
    const { onSave } = this.props;
    if (this.linkPanel.state.isValidUrl && this.linkPanel.state.url) {
      const { url, targetBlank, nofollow } = this.linkPanel.state;
      this.imageMetadataUpdated(selectedImage, { link: { url, targetBlank, nofollow } });
    } else if (this.linkPanel.state.intermediateUrl === '') {
      this.imageMetadataUpdated(selectedImage, { link: {} });
    }
    onSave(this.state.images);
  }

  getImageUrl = image => getScaleToFillImageURL(('media/' + image.url), image.metadata.width, image.metadata.height, 420, 240);

  render() {
    const styles = this.styles;
    const { onCancel, theme, isMobile, t } = this.props;
    const { images } = this.state;
    const selectedImage = images[this.state.selectedIndex];
    const { url, targetBlank, nofollow } = (!isEmpty(selectedImage.metadata.link) ? selectedImage.metadata.link : {});
    const updateLabel = t('GalleryImageSettings_Update');
    const headerLabel = t('GalleryImageSettings_Header');
    const ReplaceLabel = t('GalleryImageSettings_Replace_Label');
    const deleteLabel = t('GalleryImageSettings_Delete_Label');
    const titleLabel = t('GalleryImageSettings_Title_Label');
    const titleInputPlaceholder = t('GalleryImageSettings_Title_Input_Placeholder');
    const linkLabel = t('GalleryImageSettings_Link_Label');

    return (
      <div className={styles.galleryImageSettings}>
        <div className={styles.galleryImageSettings_content}>
          { isMobile ?
            <GallerySettingsMobileHeader
              theme={theme}
              cancel={() => onCancel(this.initialImageState)}
              save={() => this.onDoneClick(selectedImage)}
              saveName={updateLabel}
              t={t}
            /> :
            <h3
              className={classNames(styles.galleryImageSettings_backButton, styles.galleryImageSettings_title)}
              onClick={() => onCancel(this.initialImageState)}
            >
              <BackIcon className={styles.galleryImageSettings_backIcon} />{headerLabel}
            </h3>
          }
          <div
            className={classNames(styles.galleryImageSettings_scrollContainer,
              { [styles.galleryImageSettings_scrollContainer_mobile]: isMobile })}
          >
            <SettingsSection theme={theme}>
              <Image
                resizeMode={'contain'}
                className={styles.galleryImageSettings_image}
                src={this.getImageUrl(selectedImage)}
                theme={theme}
              />
              <div className={classNames(styles.galleryImageSettings_nav, { [styles.galleryImageSettings_nav_mobile]: isMobile })}>
                <i
                  className={classNames(styles.galleryImageSettings_previous,
                    { [styles.galleryImageSettings_hidden]: this.state.selectedIndex === 0 })}
                  onClick={() => this.setState({ selectedIndex: this.state.selectedIndex - 1 })}
                />
                <i
                  className={classNames(styles.galleryImageSettings_next,
                    { [styles.galleryImageSettings_hidden]: this.state.selectedIndex === images.length - 1 })}
                  onClick={() => this.setState({ selectedIndex: this.state.selectedIndex + 1 })}
                />
              </div>
            </SettingsSection>
            <div className={styles.galleryImageSettings_manageImageGrid}>
              <FileInput className={styles.galleryImageSettings_replace} onChange={this.replaceItem.bind(this)}>
                <span className={styles.galleryImageSettings_replace_text}>{ReplaceLabel}</span>
              </FileInput>
              <button className={styles.galleryImageSettings_delete} onClick={() => this.deleteImage(selectedImage)}>
                <span className={styles.galleryImageSettings_delete_text}>{deleteLabel}</span>
              </button>
            </div>
            <SettingsSection theme={theme} className={styles.galleryImageSettings_section}>
              <InputWithLabel
                theme={theme}
                label={titleLabel}
                placeholder={titleInputPlaceholder}
                value={selectedImage.metadata.title || ''}
                onChange={event => this.imageMetadataUpdated(selectedImage, { title: event.target.value })}
              />
            </SettingsSection>
            <SettingsSection theme={theme} className={this.styles.galleryImageSettings_section}>
              <label className={this.styles.inputWithLabel_label}>{linkLabel}</label>
            </SettingsSection>
            <div className={this.styles.galleryImageSettingsLinkContainer}>
              <LinkPanel
                ref={this.setLinkPanel}
                theme={theme}
                url={url}
                targetBlank={targetBlank}
                nofollow={nofollow}
                isImageSettings
                t={t}
              />
            </div>
          </div>
          {isMobile ? null : <SettingsPanelFooter
            fixed
            theme={theme}
            className={styles.galleryImageSettings_footer}
            cancel={() => onCancel(this.initialImageState)}
            save={() => this.onDoneClick(selectedImage)}
            t={t}
          />
          }
        </div>
      </div>
    );
  }
}

ImageSettings.propTypes = {
  selectedImage: PropTypes.any.isRequired,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
  t: PropTypes.func,
};

export default ImageSettings;