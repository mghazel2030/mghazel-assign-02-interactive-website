/* =========================================================
   File: cv_ui.css
   ---------------------------------------------------------
   Course: Software Development Bootcamp Course
   Assignment # 2: Interactive Website
   =========================================================
   Content: Implementations of pre-built components 
            like buttons, sliders, menus, or modal windows. 
   =========================================================
   Developer: Mohsen Ghazel
   Version: 25-Mar-2026
   =========================================================
*/

//===============================
// 1. Initialize the Image Processing
//    Operation Selection
//===============================
function initOperations(){
    let select=document.getElementById("operationSelect");
    for(let key in DATA){
        let opt=document.createElement("option");
        opt.value=key;
        opt.textContent=DATA[key].name;
        select.appendChild(opt);
    }
}

//===============================
// 2. Image Processing
//    Operation Selection
//===============================
function updateOperation(){
    // Operation selection
    let op=document.getElementById("operationSelect").value;
    let desc=document.getElementById("operationDescription");
    // Algorithm selection
    let algoSelect=document.getElementById("algorithmSelect");
    algoSelect.innerHTML='<option value="">Select algorithm</option>';
    // Parameter(s) selection
    document.getElementById("parameterContainer").innerHTML="";
    if(!op) return;
    desc.value=DATA[op].description;
    let algos=DATA[op].algorithms;
    for(let key in algos){
        let opt=document.createElement("option");
        opt.value=key;
        opt.textContent=algos[key].name;
        algoSelect.appendChild(opt);
    }
}

//===============================
// 3. Algorithm & Parameters Selections
//===============================
function updateAlgorithm(){
    // Operation selection
    let op=document.getElementById("operationSelect").value;
    // Algorithm selection
    let algo=document.getElementById("algorithmSelect").value;
    let desc=document.getElementById("algorithmDescription");
    // parameter(s) selection(s)
    let container=document.getElementById("parameterContainer");
    container.innerHTML="";
    if(!algo) return;
    let algorithm=DATA[op].algorithms[algo];
    desc.value=algorithm.description;
    let params=algorithm.parameters;
    if(Object.keys(params).length===0){
        container.innerHTML="<p>No parameters required</p>";
        return;
    }
    // Parameters selections
    for(let key in params){
        let p=params[key];
        let box=document.createElement("div");
        box.className="sliderBox";
        let label=document.createElement("label");
        label.innerText=p.name;
        let value=document.createElement("div");
        value.className="sliderValue";
        value.innerText=p.default;
        let slider=document.createElement("input");
        slider.type="range";
        slider.min=p.min;
        slider.max=p.max;
        slider.step=p.step;
        slider.value=p.default;
        slider.id=key;
        slider.addEventListener("input",function(){
            value.innerText=slider.value;
            if(window.autoRun){
                runCurrentAlgorithm();
            }
            });

        box.appendChild(label);
        box.appendChild(value);
        box.appendChild(slider);
        container.appendChild(box);
    }
}