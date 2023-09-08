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
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true);

  const viewerData = {
    gkey: "AIzaSyATeY53kvQLMGQD65ajDxKa7Qgo9GNmBrc",
    dirId: "1hA_SxgayS3SE_Gib_dvSbALrqtWGwvA-",
    name: "name1",
    options: {
      style: { width: 250 },
      onClick: {
        modal: true,
        newWindow: false
      },
      hover: true
    }
  }

  const [openPicker, data, authResponse] = useDrivePicker();
  const handleOpenPicker = async () => {
    // console.log(token)
    // if (token === null) {
    //   console.log('token is null')
    //   await getToken()
    // } else {
    //   pickPhotos()
    // }
    pickPhotos()
  }

  function pickPhotos() {
    console.log('pick images')
    openPicker({
      clientId: "286847653857-nnj3759or34tdcgiu8adp2ofv7m2rs3g.apps.googleusercontent.com",
      developerKey: "AIzaSyATeY53kvQLMGQD65ajDxKa7Qgo9GNmBrc",
      viewId: "DOCS_IMAGES_AND_VIDEOS",
      // token: token.access_token,
      token: token,
      showUploadView: true,
      showUploadFolders: true,
      disableDefaultView: true,
      supportDrives: false,
      multiselect: true,
      setParentFolder: "1hA_SxgayS3SE_Gib_dvSbALrqtWGwvA-", // https://drive.google.com/drive/folders/1hA_SxgayS3SE_Gib_dvSbALrqtWGwvA-?usp=drive_link
      locale: "sk",
      callbackFunction: (data) => {
        if (data.action === 'picked') {
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
            caption: item.ownerNames[0]
          }
        })
        if (data.size !== 0) {
          setCurrentImagePreview(data[0].src)
        }
        setImages(data)
        setIsLoading(false)
      });
  }

  async function getToken() {
    await fetch(
      'https://juicy-exuberant-brow.glitch.me/token'
    )
      .then(response => response.json())
      .then(jsonResp => {
        console.log(jsonResp)
        setToken(jsonResp.token)
      })
  };


  // const login = async () => {
  //   const client = window.google.accounts.oauth2.initTokenClien({
  //     client_id: "286847653857-nnj3759or34tdcgiu8adp2ofv7m2rs3g.apps.googleusercontent.com",
  //     scope: "https://www.googleapis.com/auth/drive.file ",
  //   });
  //   const tokenResponse = await new Promise((resolve, reject) => {
  //     try {
  //       // Settle this promise in the response callback for requestAccessToken()
  //       client.callback = (resp) => {
  //         if (resp.error !== undefined) {
  //           reject(resp);
  //         }

  //         // console.log("client resp",resp);
  //         resolve(resp);
  //       };
  //       // console.log("client",client);
  //       client.requestAccessToken({ prompt: "consent" });
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   });
  //   return tokenResponse;
  // };

  useEffect(async () => {
    getToken()
    loadData();
    setTimeout(() => {
      getToken()
   }, 3000)
  }, []);

  const [currentImagePreview, setCurrentImagePreview] = useState(null);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImagePreview(images[Math.floor(Math.random() * images.length)].src);
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
