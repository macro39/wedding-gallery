import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';
import { Gallery } from 'react-grid-gallery';

import useDrivePicker from 'react-google-drive-picker';
import { FaPlus } from 'react-icons/fa';
import { Button } from '@mui/material';
import Lightbox from 'react-image-lightbox';
import "react-image-lightbox/style.css";
import CircularProgress from '@mui/material/CircularProgress';
import toast, { Toaster } from 'react-hot-toast';

const GOOGLE_DRIVE_URL_START =
  "https://www.googleapis.com/drive/v2/files?q=%27";
const GOOGLE_DRIVE_URL_END = "%27+in+parents&key=";

function App() {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true);

  const viewerData = {
    gkey: "AIzaSyATeY53kvQLMGQD65ajDxKa7Qgo9GNmBrc",
    dirId: "1hA_SxgayS3SE_Gib_dvSbALrqtWGwvA-",
    name: "name1",
    options: {
      style: { width: 250 },
      // behavior when image is clicked
      // if on click is empty (no modal or newWindow)
      // current tab will show full image
      // if modal true, image opens as overlay
      // on current tab
      // if new window is true, new tab is launched
      // with image url
      onClick: {
        modal: true,
        newWindow: false
      },
      hover: true
    }
  }

  const [openPicker, data, authResponse] = useDrivePicker();
  const handleOpenPicker = () => {
    openPicker({
      clientId: "286847653857-nnj3759or34tdcgiu8adp2ofv7m2rs3g.apps.googleusercontent.com",
      developerKey: "AIzaSyATeY53kvQLMGQD65ajDxKa7Qgo9GNmBrc",
      viewId: "DOCS_IMAGES_AND_VIDEOS",
      token: "ya29.a0AfB_byA3sHz04WXGaQrbQZjgcApLHM_rgjLkuZHDnp--AIdC_KF1qXw_DUiLvhL6hjUUv_1PfPegmTI4EgYnZZ-ZmYvtVmuszfpHfP89aveuHg5JGE6TuUUgcyU8uDTkBGDX38SW9Fr0WIV2M3mnLas5C8Yi9ZPwBQaCgYKAfsSARASFQHsvYlsijX9m2g0EQwCNrTKDxX3iw0169",
      showUploadView: true,
      showUploadFolders: true,
      disableDefaultView: true,
      supportDrives: false,
      multiselect: true,
      setParentFolder: "1hA_SxgayS3SE_Gib_dvSbALrqtWGwvA-", // https://drive.google.com/drive/folders/1hA_SxgayS3SE_Gib_dvSbALrqtWGwvA-?usp=drive_link
      locale: "sk",
      callbackFunction: (data) => {
        console.log(data)
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button')
        } else if (data.action === 'picked') {
          toast.success('Fotky boli pridané')
          loadData()
        }
      },
    })
  }

  async function loadData() {
    await fetch(
      GOOGLE_DRIVE_URL_START +
      viewerData.dirId +
      GOOGLE_DRIVE_URL_END +
      viewerData.gkey
    )
      .then(response => response.json())
      .then(jsonResp => {
        console.log(jsonResp.items)
        const data = jsonResp.items.map((item, i) => {
          return {
            src: item.webContentLink,
            width: item.imageMediaMetadata.width,
            height: item.imageMediaMetadata.height,
            caption: ''
          }
        })
        setImages(data)
        setIsLoading(false)
        console.log(data)
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  const [currentImagePreview, setCurrentImagePreview] = useState(null);
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log(images)
      setCurrentImagePreview(images[Math.floor(Math.random()*images.length)].src);
    }, 3000)

    return () => clearInterval(intervalId);
  }, [isLoading])

  // images
  const [index, setIndex] = useState(-1);

  const currentImage = images[index];
  const nextIndex = (index + 1) % images.length;
  const nextImage = images[nextIndex] || currentImage;
  const prevIndex = (index + images.length - 1) % images.length;
  const prevImage = images[prevIndex] || currentImage;

  const handleImageClick = (index, item) => setIndex(index);
  const handleClose = () => setIndex(-1);
  const handleMovePrev = () => setIndex(prevIndex);
  const handleMoveNext = () => setIndex(nextIndex);

  return (
    <div className='container'>
      <Toaster />
      <h1 className='centerText'>Natália & Kamil</h1>
      <h1 className='centerText'>9.9.2023</h1>
      {currentImagePreview &&
      <div className='centerInner' height="300px">
          <img className='imgPreview' src={currentImagePreview} />
        </div>
      }
      <h2 className='centerText'>Prezrite si galériu našich fotiek</h2>
      {isLoading && <div className='centerInner'>
        <CircularProgress className='item' />
      </div>}
      {images &&
          <Gallery
            images={images}
            onClick={handleImageClick}
            enableImageSelection={false}
          />
      }
      {!!currentImage && (
        <Lightbox
          mainSrc={currentImage.src}
          imageTitle={currentImage.caption}
          mainSrcThumbnail={currentImage.src}
          nextSrc={nextImage.src}
          nextSrcThumbnail={nextImage.src}
          prevSrc={prevImage.src}
          prevSrcThumbnail={prevImage.src}
          onCloseRequest={handleClose}
          onMovePrevRequest={handleMovePrev}
          onMoveNextRequest={handleMoveNext}
        />
      )}
      <div className='btn-holder'>
        <Button size='large' variant="contained" color="primary" onClick={handleOpenPicker} startIcon={<FaPlus />}>
          Nahraj fotky
        </Button>
      </div>
    </div>
  );
}

export default App;
