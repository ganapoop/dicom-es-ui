const exampleImageIdLoader = (cs, buf, filePath) => {

  /*
  const str2ab = (buf) => {
      // const buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
      const bufView = new Uint8Array(buf);
      // let index = 0;
      // for (let i=0, strLen=str.length; i<strLen; i+=2) {
      //     var lower = str.charCodeAt(i);
      //     var upper = str.charCodeAt(i+1);
      //     bufView[index] = lower + (upper <<8);
      //     index++;
      // }
      return bufView;
  }

  const getPixelData= (base64PixelData) => {
      // const pixelDataAsString = window.atob(base64PixelData);
      const pixelData = str2ab(base64PixelData);
      return pixelData;
  }

  const imagePixelData = getPixelData(buf);

  */
  function getExampleImage(imageId) {
    const width = 256;
    const height = 256;

    function getPixelData() {
      return buf;
//      return imagePixelData
    }

    return {
      promise: new Promise((resolve) => resolve({
            imageId: filePath,
            minPixelValue : 0,
            maxPixelValue : 257,
            slope: 1.0,
            intercept: 0,
            windowCenter : 127,
            windowWidth : 256,
            // render: cornerstone.renderGrayscaleImage,
            getPixelData: getPixelData,
            rows: height,
            columns: width,
            height: height,
            width: width,
            color: false,
            columnPixelSpacing: .8984375,
            rowPixelSpacing: .8984375,
            sizeInBytes: width * height * 2
        })
      ),
      cancelFn: undefined
    };
  }


    // register our imageLoader plugin with cornerstone
  cs.registerImageLoader('example', getExampleImage);
};

export default exampleImageIdLoader;