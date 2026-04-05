/* =========================================================
   File: data.js
   ---------------------------------------------------------
   Course: Software Development Bootcamp Course
   Assignment # 2: Interactive Website
   =========================================================
   Content: The descriptions of the different:
            - Image processing operations
            - Algorithms
            - Parameters
   =========================================================
   Developer: Mohsen Ghazel
   Version: 25-Mar-2026
   =========================================================
*/

const DATA = {

    //===============================
    // 1. Image-Enhancement:
    //===============================
    contrast:{
        // Operation name
        name:"Contrast Enhancement",
        // Description
        description:"Enhance image brightness and contrast.",
        // Available algorithms
        algorithms:{
            // 1.1: Gamma-correction
            gamma_correction:{
                name:"Gamma Correction",
                description:"Nonlinear brightness adjustment.",
                parameters:{
                    gamma:{name:"Gamma",min:0.1,max:3,step:0.1,default:1}
                }
            },
            // 1.2: Linear-Transformation
            linear:{
                name:"Linear Brightness & Contrast",
                description:"Output = alpha * input + beta.",
                parameters:{
                    alpha:{name:"Alpha",min:0,max:3,step:0.1,default:1},
                    beta:{name:"Beta",min:-100,max:100,step:1,default:0}
                }
            },
            // 1.3: CLAHE
            clahe:{
                name:"CLAHE",
                description:"Adaptive histogram equalization.",
                parameters:{
                    clip_limit:{name:"Clip Limit",min:1,max:10,step:0.5,default:2},
                    tile_grid_size:{name:"Tile Grid Size",min:2,max:16,step:1,default:8}
                }
            },
            // 1.4: GE
            ghe:{
                name:"Global Histogram Equalization",
                description:"Redistributes global intensity histogram.",
                parameters:{}
            }
        }
    },

    //===============================
    // 2. Image-Denoising:
    //===============================
    denoising:{
        // Operation name
        name:"Image Denoising",
        // Description
        description:"Remove noise using spatial filtering techniques.",
        // Available algorithms
        algorithms:{
            // 2.1: The Mean-Filter
            mean:{
                name:"Mean Filter",
                description:"Average filter smoothing.",
                parameters:{
                    kernel:{name:"Kernel Size",min:1,max:15,step:2,default:3}
                }
            },
            // The Median-Filter
            median:{
                name:"Median Filter",
                description:"Median filtering for impulse noise removal.",
                parameters:{
                    kernel:{name:"Kernel Size",min:1,max:15,step:2,default:3}
                }
            },
            // The Gaussian-Filter
            gaussian:{
                name:"Gaussian Filter",
                description:"Gaussian smoothing filter.",
                parameters:{
                    kernel:{name:"Kernel Size",min:1,max:15,step:2,default:5},
                    sigma:{name:"Sigma",min:0.1,max:10,step:0.1,default:1}
                }
            },
        }
    },

    //===============================
    // 3. Edge-Detection:
    //===============================
    edge_detection:{
        // Operation name
        name:"Edge Detection",
        // Description
        description:"Detect edges and structural boundaries in images using gradient based operators.",
        // Available algorithms
        algorithms:{
            // 3.1: Canny-Edge-Detector
            canny:{
                name:"Canny Edge Detection",
                description:"Multi-stage edge detection using gradient magnitude and hysteresis thresholding.",
                parameters:{
                    threshold1:{
                        name:"Lower Threshold",
                        min:0,
                        max:200,
                        step:1,
                        default:50
                    },
                    threshold2:{
                        name:"Upper Threshold",
                        min:0,
                        max:300,
                        step:1,
                        default:150
                    },
                    aperture:{
                        name:"Aperture Size",
                        min:3,
                        max:7,
                        step:2,
                        default:3
                    }
                }
            },
            // 3.2: Sobel-Edge-Detector
            sobel:{
                name:"Sobel Operator",
                description:"Computes image gradients using Sobel derivative filters.",
                parameters:{
                    kernel:{
                        name:"Kernel Size",
                        min:1,
                        max:7,
                        step:2,
                        default:3
                    }

                }
            },
            // 3.3: Laplacian-Edge-Detector
            laplacian:{
                name:"Laplacian Operator",
                description:"Second-order derivative operator highlighting regions of rapid intensity change.",
                parameters:{
                    kernel:{
                        name:"Kernel Size",
                        min:1,
                        max:7,
                        step:2,
                        default:3
                    }
                }
            }
        }
    }
};