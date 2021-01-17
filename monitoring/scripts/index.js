/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const audioUp = document.getElementById("audioUp"); 
const audioDown = document.getElementById("audioDown"); 
const audioEliminated = document.getElementById("audioEliminated");
const tacticSelection = document.getElementById("tactic");
let alreadyInit = false;
let onAutostart = false;
let ingame = false;
let tacticData = {};

/**
 * Gets called when the start button gets clicked
 * Prepares all things and enqueues
 */
const startButton = () => {
    if(onAutostart || ingame){
        return;
    }
    let options = {
        "tactic": tacticSelection.value,
        
    };
    if(tacticSelection.value == "dontHit"){
        let list = dontHit_patternSelection.getElementsByTagName("li");
        let pattern = new Array(3);
        for(let i=0;i < list.length; i++) {
            let arrValue = list[i].firstChild.data;
            switch(arrValue){
                case "Front":
                    pattern[0] = i;
                    break;
                case "Left":
                    pattern[1] = i;
                    break;
                case "Right":
                    pattern[2] = i;
                    break;
            }
        }

        options.pattern = {
            front: pattern[0],
            left: pattern[1],
            right: pattern[2]
        };
    }
    if(tacticSelection.value == "recursiveBnB"){
        options.searchDepth = document.getElementById("recursiveBnB_searchDepth").value;
        options.useRandom = document.getElementById("recursiveBnB_useRandom").checked;

        let list = recursiveBnB_patternSelection.getElementsByTagName("li");
        let order = [];
        for(let i=0; i < list.length; i++) {
            let arrValue = list[i].firstChild.data;
            switch(arrValue){
                case "Change nothing":
                    order.push("CN");
                    break;
                case "Turn left":
                    order.push("TL");
                    break;
                case "Turn right":
                    order.push("TR");
                    break;
                case "Slow down":
                    order.push("SD");
                    break;
                case "Speed up":
                    order.push("SU");
                    break;
            }
        }
        options.order = order;

    }
    if(tacticSelection.value == "dangerFields"){
        options.useAlternative = document.getElementById("dangerFields_useAlternative").checked;
        options.closest = document.getElementById("dangerFields_closest").checked;
    }
    if(tacticSelection.value == "tfModels"){
        options.model = document.getElementById("tfModels_selection").value;
    }

    console.log("Connecting to Server. . .");
    socket.emit("startGame", options);  
};
document.getElementById("startButton").addEventListener("click", startButton);

document.getElementById("autostartCheck").addEventListener("change", (event) => {
    if (event.target.checked) {
      socket.emit("autostart", true);
          console.log("autostart: true");
    } else {
      socket.emit("autostart", false);
      console.log("autostart: false");
    }
  });
  

/**
 * Updates the game field
 */
const draw = () => {
    ctx.clearRect(0, 0, multiplyer*width, multiplyer*height);

    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            ctx.beginPath();
            ctx.rect(x*multiplyer, y*multiplyer, multiplyer, multiplyer);
            ctx.fillStyle = getFillColor(cells[y][x]);
            ctx.fill();
        }
    }
    // draw heads
    Object.entries(players).forEach((item, index) => {
        let x = item[1].x; // object.entries gibt ein Array ([0] ist Index und [1] ist Value)
        let y = item[1].y;

        ctx.beginPath(); // path im Sinne von Zeichnung
        ctx.arc(x*multiplyer+(multiplyer/2), y*multiplyer+(multiplyer/2), (multiplyer/4), 0, (multiplyer/4) * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
    });
};

document.getElementById("tactic_dangerFields").style.display = "block";
tacticSelection.addEventListener("change", () => {
    hideTacticInfos();
    switch(tacticSelection.value){
        case "recursiveBnB":
            document.getElementById("tactic_recursiveBnB").style.display = "block";
            return;
        case "dontHit":
            document.getElementById("tactic_dontHit").style.display = "block";
            return;
        case "dontHitRandom":
            document.getElementById("tactic_dontHitRandom").style.display = "block";
            return;
        case "dontHitSemiRandom":
            document.getElementById("tactic_dontHitSemiRandom").style.display = "block";
            return;
        case "dangerFields":
            document.getElementById("tactic_dangerFields").style.display = "block";
            return;
        case "tfModels":
            document.getElementById("tactic_tfModels").style.display = "block";
            return;
        case "exampleTactic":
            document.getElementById("tactic_exampleTactic").style.display = "block";
            return;
        
        default:
            //do nothing
            return;
    }
});

/**
 * Hides all tactic infos
 */
const hideTacticInfos = () => {
    const tacticOptions = document.getElementById("tacticOptions");
    for(let i = 0; i < tacticOptions.children.length; i++){
        tacticOptions.children[i].style.display = "none";
    }
    
};

document.getElementById("tfModels_download").addEventListener("click", () => {
    socket.emit("downloadModels");  
});


const dontHit_patternSelection = document.getElementById("dontHit_patternSelection");
const dontHit_sortable = Sortable.create(dontHit_patternSelection, {
    animation: 150,
    ghostClass: "blue-background-class",
});
const recursiveBnB_patternSelection = document.getElementById("recursiveBnB_patternSelection");
const recusriveBnB_sortable = Sortable.create(recursiveBnB_patternSelection, {
    animation: 150,
    ghostClass: "blue-background-class",
});