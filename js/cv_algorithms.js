/* 
   =========================================================
   File: cv_algorithms.js
   ---------------------------------------------------------
   Course: Software Development Bootcamp Course
   Assignment # 2: Interactive Website
   =========================================================
   Content: The implementation of the different algorithms in 
            OpenCV-JavaScript.
   =========================================================
   Developer: Mohsen Ghazel
   Version: 25-Mar-2026
   =========================================================
*/
// =========================================================
// 1. Image-Enhancement Algorithms
// =========================================================
// These algorithms improve the contracts of the input image
// =========================================================
/*
    1.1: Gamma-Correction Algorithm
*/
function gammaCorrection(src,gamma){
    // Initialize the output image
    let dst=new cv.Mat();

    // Initialize the Look-Up-Table (LUT)
    let lut=new cv.Mat(1,256,cv.CV_8U);

    // Iterate over the grayscale values
    for(let i=0;i<256;i++){
        // Scale the intensity using the gamma-correction algorithm
        let v=Math.pow(i/255.0,gamma)*255;
        // Update the LUT
        lut.ucharPtr(0,i)[0]=Math.min(255,Math.max(0,v));
    }
    // Apply the LUT to get the output image
    cv.LUT(src,lut,dst);

    // Free the LUT
    lut.delete();

    // Return the gamma-corrected image
    return dst;
}

/*
    1.2: Linear Transformation Algorithm
*/
function linearTransform(src,alpha,beta){
    // Initialize the output image
    let dst=new cv.Mat();

    // Apply the linear transformation on the source image 
    // and store results in the output image to get the output image
    src.convertTo(dst,-1,alpha,beta);

    // Return the output image
    return dst;
}

/*
    1.3: Contrast-Limited Histogram Equalization (CLAHE) Algorithm
*/
function claheEnhancement(src,clip,tile){
    // Initialize the output images
    // A temporary grayscale image
    let gray=new cv.Mat();

    // The output image
    let dst=new cv.Mat();

    // Convert the image to grayscale
    cv.cvtColor(src,gray,cv.COLOR_RGBA2GRAY);

    // Create the CLAHE filter using the (clip, tile) parameters using OpenCV-js
    let clahe=new cv.CLAHE(clip,new cv.Size(tile,tile));
    // Apply the CLAHE filter on the grayscale image
    clahe.apply(gray,dst);

    // Convert back to color to get the output image
    cv.cvtColor(dst,dst,cv.COLOR_GRAY2RGBA);

    // Delete the temporary gray image
    gray.delete();

    // Return the output image
    return dst;
}

/*
    1.4: Global Histogram Equalization (GHE) Algorithm
*/
function globalHistEqualization(src){
    // Initialize the output images
    // A temporary grayscale image
    let gray=new cv.Mat();

    // The output image
    let dst=new cv.Mat();

    // Convert to grayscale
    cv.cvtColor(src,gray,cv.COLOR_RGBA2GRAY);

    // Apply the GHE algorithm using OpenCV-js
    cv.equalizeHist(gray,dst);
    // COnvert back to color to get the output image
    cv.cvtColor(dst,dst,cv.COLOR_GRAY2RGBA);

    // Delete the temporary gray image
    gray.delete();

    // Return the output image
    return dst;
}

// =========================================================
// 2. Image-Denoising:
// =========================================================
// These algorithms reduce the noise in a noisy image
// =========================================================
/*
    2.1: The Mean-Filter
*/
function meanFilter(src,k){
    // Initialize the output image
    let dst=new cv.Mat();

    // Construct the filter kernel using the filter-size (k) parameter
    let ksize=new cv.Size(k,k);

    // Apply the Mean-Filter using OpenCV-js to get the output image
    cv.blur(src,dst,ksize);

    // Return the filtered image
    return dst;
}

/*
    2.1: The Median-Filter
*/
function medianFilter(src,k){
    // Initialize the output image
    let dst=new cv.Mat();

    // Apply the Median-Filter using OpenCV-js to get the output image
    cv.medianBlur(src,dst,k);

    // Return the filtered image
    return dst;
}

/*
    2.3: The Gaussian-Blur-Filter
*/
function gaussianFilter(src,k,sigma){
    // Initialize the output image
    let dst=new cv.Mat();

    // Construct the filter kernel using the filter-size (k) parameter
    let ksize=new cv.Size(k,k);

    // Apply the Gaussian-Blur-Filter using OpenCV-js to get the output image
    cv.GaussianBlur(src,dst,ksize,sigma,sigma);

    // Return the output image
    return dst;
}

// =========================================================
// 3. Edge-Detection:
// =========================================================
// These algorithms detect edges in an image
// =========================================================
/*
    3.1: The Canny-Edge-Detector
*/
function cannyEdge(src, t1, t2, aperture){
    // Initialize the temp grayscale image
    let gray = new cv.Mat();
    // Initialize the temp detected edges map
    let edges = new cv.Mat();

    // Initialize the output image
    let dst = new cv.Mat();

    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Apply the built-in OpenCV-js Canny-edge-detector filter
    cv.Canny(gray, edges, t1, t2, aperture);

    // Convert back to color image to get the output image
    cv.cvtColor(edges, dst, cv.COLOR_GRAY2RGBA);

    // Delete the temp images
    gray.delete();
    edges.delete();

    // Return the output image
    return dst;
}

/*
    3.2: The Sobel-Edge-Detector
*/
function sobelEdge(src, kernel){
    // Initialize temp images
    let gray = new cv.Mat();
    let gradX = new cv.Mat();
    let gradY = new cv.Mat();
    let absX = new cv.Mat();
    let absY = new cv.Mat();

    // Initialize the output image
    let dst = new cv.Mat();

    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Apply the built-in Sobel edge-detection-filter in horizontal/vertical directions
    cv.Sobel(gray, gradX, cv.CV_16S, 1, 0, kernel);
    cv.Sobel(gray, gradY, cv.CV_16S, 0, 1, kernel);
    // Convert to magnitudes of the computed edges
    cv.convertScaleAbs(gradX, absX);
    cv.convertScaleAbs(gradY, absY);
    // Combine the horizontal/vertical edges-magnitudes
    cv.addWeighted(absX,0.5,absY,0.5,0,dst);

    // Convert back to color to get the output image
    cv.cvtColor(dst,dst,cv.COLOR_GRAY2RGBA);

    // Delete the temp images
    gray.delete();
    gradX.delete();
    gradY.delete();
    absX.delete();
    absY.delete();

    // Return the output image
    return dst;
}

/*
    3.3: The Laplacian-Edge-Detector
*/
function laplacianEdge(src,kernel){
    // Initialize temp images
    let gray=new cv.Mat();
    let lap=new cv.Mat();

    // Initialize the output image
    let dst=new cv.Mat();

    // Convert to grayscale
    cv.cvtColor(src,gray,cv.COLOR_RGBA2GRAY);

    // Apply the built-in Laplacian edge-detection-filter
    cv.Laplacian(gray,lap,cv.CV_16S,kernel);
    // Convert to magnitudes of the computed edges to get the output image
    cv.convertScaleAbs(lap,dst);

    // Convert back to color
    cv.cvtColor(dst,dst,cv.COLOR_GRAY2RGBA);

    // Delete temp images
    gray.delete();
    lap.delete();

    // Return the output image
    return dst;
}