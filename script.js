document.addEventListener("DOMContentLoaded",()=>{

    // ==================================================
    // STATE GAME
    // ==================================================
    let level = 1;
    let score = 0;
    let lives = 3;
    let time = 60;
    let timer = null;
    let correct = [];
    let dragItem = null;
    let soundOn = true;
    let isPaused = false;

    // ==================================================
    // ELEMENT HTML
    // ==================================================
    const home = document.getElementById("home");
    const game = document.getElementById("game");

    const startBtn = document.getElementById("startBtn");
    const checkBtn = document.getElementById("checkBtn");

    const playerName = document.getElementById("playerName");

    const slots = document.getElementById("slots");
    const steps = document.getElementById("steps");

    const levelText = document.getElementById("level");
    const timeText = document.getElementById("time");
    const scoreText = document.getElementById("score");
    const heartText = document.getElementById("heart");

    const settings = document.getElementById("settings");
    const settingsContent = document.getElementById("settingsContent");

    const openSettingsHome = document.getElementById("openSettingsHome");
    const openSettingsGame = document.getElementById("openSettingsGame");

    // RESULT
    const result = document.getElementById("result");
    const resultTitle = document.getElementById("resultTitle");
    const retryBtn = document.getElementById("retryBtn");
    const nextBtn = document.getElementById("nextBtn");
    const settingsBtn = document.getElementById("settingsBtn");

    // AUDIO
    const bg = document.getElementById("bg");
    const nextSound = document.getElementById("next");
    const winSound = document.getElementById("win");
    const loseSound = document.getElementById("lose");

    // ==================================================
    // DATA LEVEL
    // ==================================================
    const levels = [
        {time:60, steps:["Start Program","Input Number","Display Number","End Program"]},
        {time:55, steps:["Start","Input Name","Process Data","Display Name","End"]},
        {time:55, steps:["Start","Input Score","If Score > 75","Display Passed","End"]},
        {time:50, steps:["Start","Input Age","If Age >= 17","Display Eligible","Else Not Eligible","End"]},
        {time:45, steps:["Start","Input Number 1","Input Number 2","Calculate Sum","Display Result","End"]},
        {time:40, steps:["Start","Input Username","Input Password","Validate Data","If Correct Login","End"]},
        {time:35, steps:["Start","Loop 1-5","Display Number","End Loop","End"]},
        {time:30, steps:["Start","Input Data","Check Empty Data","If Not Empty","Save Data","End"]},
        {time:25, steps:["Start","Input Total Purchase","If > 100000","Apply 10% Discount","Calculate Total","Display Total","End"]},
        {time:25, steps:["Start","Input Number","If Even","Display Even","Else Display Odd","End"]}
    ];

    // ==================================================
    // START GAME
    // ==================================================
    function startGame(){

        if(playerName.value.trim() === ""){
            alert("Enter your name first!");
            return;
        }

        home.classList.add("hidden");
        game.classList.remove("hidden");

        level = 1;
        score = 0;
        lives = 3;

        if(soundOn){
            bg.currentTime = 0;
            bg.play().catch(()=>{});
        }

        loadLevel();
    }

    // ==================================================
    // LOAD LEVEL
    // ==================================================
    function loadLevel(){

        clearInterval(timer);

        let data = levels[level - 1];
        correct = data.steps;
        time = data.time;

        slots.innerHTML = "";
        steps.innerHTML = "";

        // ---------- DROP AREA STEP ASLI ----------
        steps.ondragover = e => e.preventDefault();

        steps.ondrop = ()=>{
            if(!dragItem) return;
            steps.appendChild(dragItem);
            dragItem = null;
        };

        // ==================================================
        // BUAT SLOT
        // ==================================================
        correct.forEach(()=>{

            let s = document.createElement("div");
            s.className = "slot";

            s.ondragover = e => e.preventDefault();

            s.ondrop = ()=>{

                if(!dragItem) return;

                if(s.firstChild){
                    steps.appendChild(s.firstChild);
                }

                s.appendChild(dragItem);
                dragItem = null;
            };

            slots.appendChild(s);
        });

        // ==================================================
        // BUAT STEP ACAK
        // ==================================================
        [...correct].sort(()=>Math.random()-0.5).forEach(text=>{

            let d = document.createElement("div");
            d.className = "step";
            d.innerText = text;
            d.draggable = true;

            // DESKTOP
            d.ondragstart = ()=> dragItem = d;
            d.ondragend = ()=> dragItem = null;

            // ==================================================
            // TOUCHSCREEN SUPPORT
            // ==================================================
            d.addEventListener("touchstart",()=>{
                dragItem = d;
            });

            d.addEventListener("touchmove",(e)=>{

                if(!dragItem) return;

                e.preventDefault();

                let t = e.touches[0];

                d.style.position = "fixed";
                d.style.left = (t.clientX - d.offsetWidth/2) + "px";
                d.style.top = (t.clientY - d.offsetHeight/2) + "px";
                d.style.zIndex = "9999";
                d.style.pointerEvents = "none";
            });

            d.addEventListener("touchend",(e)=>{

                let t = e.changedTouches[0];
                let target = document.elementFromPoint(t.clientX,t.clientY);

                let slot = target?.closest(".slot");
                let stepArea = target?.closest("#steps");

                // kalau ke slot
                if(slot){

                    if(slot.firstChild){
                        steps.appendChild(slot.firstChild);
                    }

                    slot.appendChild(d);
                }

                // kalau ke tempat awal
                else if(stepArea){
                    steps.appendChild(d);
                }

                // reset style
                d.style.position = "static";
                d.style.left = "";
                d.style.top = "";
                d.style.zIndex = "";
                d.style.pointerEvents = "";

                dragItem = null;
            });

            steps.appendChild(d);
        });

        updateUI();
        startTimer();
    }

    // ==================================================
    // TIMER
    // ==================================================
    function startTimer(){

        clearInterval(timer);

        timer = setInterval(()=>{

            if(isPaused) return;

            if(time <= 0){
                clearInterval(timer);
                lose();
                return;
            }

            time--;

            let m = String(Math.floor(time/60)).padStart(2,"0");
            let s = String(time%60).padStart(2,"0");

            timeText.innerText = `${m}:${s}`;

        },1000);
    }

    // ==================================================
    // CHECK JAWABAN
    // ==================================================
    function checkAnswer(){

        let benar = true;

        document.querySelectorAll(".slot").forEach((slot,i)=>{
            if(!slot.firstChild || slot.firstChild.innerText !== correct[i]){
                benar = false;
            }
        });

        if(benar){

            score += 10;
            level++;

            if(level > levels.length){
                if(soundOn) winSound.play();
                showResult("win");
                updateUI();
                return;
            }

            if(soundOn) nextSound.play();

            showResult("complete");
        }else{
            lose();
        }

        updateUI();
    }

    // ==================================================
    // LOSE
    // ==================================================
    function lose(){

        lives--;

        if(lives <= 0){

            if(soundOn){
                loseSound.currentTime = 0;
                loseSound.play().catch(()=>{});
            }

            showResult("lose");

        }else{
            loadLevel();
        }

        updateUI();
    }

    // ==================================================
    // RESULT
    // ==================================================
    function showResult(type){

        clearInterval(timer);

        result.classList.remove("hidden");

        retryBtn.style.display = "none";
        nextBtn.style.display = "none";
        settingsBtn.style.display = "none";

        if(type === "complete"){
            resultTitle.innerText = "LEVEL COMPLETE 🎉";
            retryBtn.style.display = "block";
            nextBtn.style.display = "block";
            settingsBtn.style.display = "block";
        }

        if(type === "lose"){
            resultTitle.innerText = "YOU LOSE 😢";
            settingsBtn.style.display = "block";
            settingsBtn.innerText = "🔄 Retry";
            settingsBtn.onclick = ()=> location.reload();
        }

        if(type === "win"){
            resultTitle.innerText = "🏆 CONGRATULATIONS";
            settingsBtn.style.display = "block";
            settingsBtn.innerText = "🏠 Home";
            settingsBtn.onclick = ()=> location.reload();
        }
    }

    // ==================================================
    // SETTINGS
    // ==================================================
    function openSettings(){

        isPaused = true;

        settingsContent.innerHTML = `
            <h3>Settings</h3>
            <button id="soundBtn">🔊 ${soundOn ? "ON":"OFF"}</button>
            <button id="themeBtn">🌙 Theme</button>
            <button id="homeBtn">🏠 Home</button>
            <button id="closeBtn">⬅ Back</button>
        `;

        settings.classList.remove("hidden");

        document.getElementById("soundBtn").onclick = ()=>{
            soundOn = !soundOn;
            bg.muted = !soundOn;
            openSettings();
        };

        document.getElementById("themeBtn").onclick = ()=>{
            document.body.classList.toggle("dark");
        };

        document.getElementById("homeBtn").onclick = ()=>{
            location.reload();
        };

        document.getElementById("closeBtn").onclick = closeSettings;
    }

    function closeSettings(){
        settings.classList.add("hidden");
        isPaused = false;
    }

    // ==================================================
    // UPDATE UI
    // ==================================================
    function updateUI(){
        levelText.innerText = "Level " + level;
        scoreText.innerText = score;
        heartText.innerText = "❤️".repeat(lives);
    }

    // ==================================================
    // EVENT BUTTON
    // ==================================================
    startBtn.addEventListener("click", startGame);
    checkBtn.addEventListener("click", checkAnswer);

    retryBtn.addEventListener("click",()=>{
        result.classList.add("hidden");
        loadLevel();
    });

    nextBtn.addEventListener("click",()=>{
        result.classList.add("hidden");
        loadLevel();
    });

    settingsBtn.addEventListener("click",()=>{
        result.classList.add("hidden");
        openSettings();
    });

    openSettingsHome.addEventListener("click", openSettings);
    openSettingsGame.addEventListener("click", openSettings);

    // ==================================================
    // KEYBOARD
    // ==================================================
    document.addEventListener("keydown",(e)=>{

        if(e.key === "Enter"){

            if(!home.classList.contains("hidden")){
                startGame();
            }

            else if(
                !game.classList.contains("hidden") &&
                settings.classList.contains("hidden") &&
                result.classList.contains("hidden")
            ){
                checkAnswer();
            }
        }

        if(e.key.toLowerCase() === "s" && !game.classList.contains("hidden")){

            if(settings.classList.contains("hidden")){
                openSettings();
            }else{
                closeSettings();
            }
        }
    });

    // ==================================================
    // AUTOPLAY
    // ==================================================
    document.body.addEventListener("click",()=>{
        if(soundOn){
            bg.play().catch(()=>{});
        }
    },{once:true});

});
