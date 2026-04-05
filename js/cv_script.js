/* =========================================================
   File: The Computer Vision App JS File: cv_script.js
   ---------------------------------------------------------
   Course: Software Development Bootcamp Course
   Assignment # 2: Interactive Website
   =========================================================
   Content: The main JavaScript file of the App.
   =========================================================
   Developer: Mohsen Ghazel
   Version: 25-Mar-2026
   =========================================================
*/

// =========================================================
// 1. Load the input image
// =========================================================
// Initialize the input image array
let srcMat = null;
window.autoRun = false;

window.onload = function () {
    // Initialization
    initOperations();
    // Get the user image processing operation selection
    document.getElementById("operationSelect").addEventListener("change", updateOperation);
    // Get the user algorithm selection
    document.getElementById("algorithmSelect").addEventListener("change", updateAlgorithm);
};
// Upload the input image
document.getElementById("imageInput").addEventListener("change",function(e){
    // Get the file user selection
    let file=e.target.files[0];
    // Initialize the image array
    let img=new Image();
    // Create an image object
    img.src=URL.createObjectURL(file);
    /*
      A function for reading and loading the original input image
    */
    img.onload=function(){
        // Prepare the original input image canvas
        let canvas=document.getElementById("originalCanvas");
        let ctx=canvas.getContext("2d");
        // Set the image canvas size
        let maxWidth=600;
        let maxHeight=450;
        // Get the actual input image size
        let width=img.width;
        let height=img.height;
        // Compute the common scale as the minimum of the horizontal/vertical scaling
        let scale=Math.min(maxWidth/width,maxHeight/height,1);
        // Update the input image canvas size
        let newWidth=width*scale;
        let newHeight=height*scale;
        // Set the scaled canvas size
        canvas.width=newWidth;
        canvas.height=newHeight;
        // Overlay the original input image on the canvas
        ctx.clearRect(0,0,newWidth,newHeight);
        ctx.drawImage(img,0,0,newWidth,newHeight);
        // Read the original input image into a array using OpenCV-js
        srcMat=cv.imread(canvas);
    };
});

// =========================================================
// 2. Execute the user selected image processing
// =========================================================
/*
    Execute the user selected image processing operation and 
    associate algorithm and parameters.
*/
function runCurrentAlgorithm() {
    // Check if valid input image
    if (!srcMat) return;
    // get the algorithm selection
    let algo = document.getElementById("algorithmSelect").value;
    // Initialize the output image
    let dst;
    // Initialize the start of algorithm execution
    let start = performance.now();


    /* ---------------- 1. CONTRAST ENHANCEMENT ALGORITHMS ---------------- */
    // 1.1: Gamma-Correction
    if (algo === "gamma_correction") {
        // Get the gamma-parameter user selection value
        let gamma = parseFloat(document.getElementById("gamma").value);
        // Call the gamma-correction algorithm 
        dst = gammaCorrection(srcMat, gamma);
    }
    // 1.2: Linear-Transformation
    else if (algo === "linear") {
        // Get the alpha-parameter user selection value
        let alpha = parseFloat(document.getElementById("alpha").value);
         // Get the beta-parameter user selection value
        let beta = parseFloat(document.getElementById("beta").value);
        // Call the linear-transformation algorithm 
        dst = linearTransform(srcMat, alpha, beta);
    }
    // 1.3: CLAHE
    else if (algo === "clahe") {
        // Get the clip-limit-parameter user selection value
        let clip = parseFloat(document.getElementById("clip_limit").value);
        // Get the tile-grid-size-parameter user selection value
        let tile = parseInt(document.getElementById("tile_grid_size").value);
        // Call the CLAHE algorithm 
        dst = claheEnhancement(srcMat, clip, tile);
    }
    // 1.4: GHE
    else if (algo === "ghe") {
        // Call the GHE algorithm 
        dst = globalHistEqualization(srcMat);
    }


    /* ---------------- 2. IMAGE DENOISING ALGORITHMS ---------------- */
    // 2.1: The Mean-Filter
    else if (algo === "mean") {
        // Get the filter-size-parameter user selection value
        let k = parseInt(document.getElementById("kernel").value);
        // Kernel-based filters should force odd kernel sizes (OpenCV requirement).
        if (k % 2 === 0) k += 1;
        // Call the Mean-Filter algorithm 
        dst = meanFilter(srcMat, k);
    }
    // 2.2: The Median-Filter
    else if (algo === "median") {
        // Get the filter-size-parameter user selection value
        let k = parseInt(document.getElementById("kernel").value);
        // Kernel-based filters should force odd kernel sizes (OpenCV requirement).
        if (k % 2 === 0) k += 1;
        // Call the Median-Filter algorithm 
        dst = medianFilter(srcMat, k);
    }
    // 2.3: The Gaussian-Filter
    else if (algo === "gaussian") {
        // Get the filter-size-parameter user selection value
        let k = parseInt(document.getElementById("kernel").value);
        // Kernel-based filters should force odd kernel sizes (OpenCV requirement).
        if (k % 2 === 0) k += 1;
        // Get the sigma-parameter user selection value
        let sigma = parseFloat(document.getElementById("sigma").value);
        // Call the Gaussian-Filter algorithm 
        dst = gaussianFilter(srcMat, k, sigma);
    }

    /* ---------------- 3. EDGE DETECTION ALGORITHMS ---------------- */
    // 3.1: The Canny-edge-detector
    else if(algo==="canny"){
        // Get the lower-threshold-parameter user selection value
        let t1=parseFloat(document.getElementById("threshold1").value);
        // Get the upper-threshold-parameter user selection value
        let t2=parseFloat(document.getElementById("threshold2").value);
        // Get the aperture-parameter user selection value
        let ap=parseInt(document.getElementById("aperture").value);
        // Call the Canny-edge-detector algorithm 
        dst=cannyEdge(srcMat,t1,t2,ap);
    }
    // 3.2: The Sobel-edge-detector
    else if(algo==="sobel"){
        // Get the filter-size-parameter user selection value
        let k=parseInt(document.getElementById("kernel").value);
        // Kernel-based filters should force odd kernel sizes (OpenCV requirement).
        if (k % 2 === 0) k += 1;
        // Call the Sobel-edge-detector algorithm 
        dst=sobelEdge(srcMat,k);
    }
    // 3.2: The Laplacian-edge-detector
    else if(algo==="laplacian"){
        // Get the filter-size-parameter user selection value
        let k=parseInt(document.getElementById("kernel").value);
        // Kernel-based filters should force odd kernel sizes (OpenCV requirement).
        if (k % 2 === 0) k += 1;
        // Call the Laplacian-edge-detector algorithm 
        dst=laplacianEdge(srcMat,k);
    }
    // Return the output image if valid
    if (!dst) return;

    // Display the output image in the output-image canvas
    let outputCanvas=document.getElementById("outputCanvas");
    outputCanvas.width=dst.cols;
    outputCanvas.height=dst.rows;
    cv.imshow(outputCanvas,dst);

    // Set the end-of-execution time-point
    let end = performance.now();
    // Compute the execution time 
    document.getElementById("runtimeValue").innerText = (end - start).toFixed(2);
    // Free the output image array
    dst.delete();
}

/*
    Run-button event handler
*/
document.getElementById("runButton").addEventListener("click", function () {
    runCurrentAlgorithm();
    window.autoRun = true;
});


/*
    Download-button event handler
*/
document.getElementById("downloadButton").addEventListener("click", function () {
    // Get the output image to be saved
    let canvas = document.getElementById("outputCanvas");
    // Create a link for the output image
    let link = document.createElement("a");
    // The output image file name
    link.download = "processed_image.png";
    // Point the link to the output image data
    link.href = canvas.toDataURL();
    // Listen for download link click
    link.click();
});