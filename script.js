document.addEventListener("DOMContentLoaded",()=>{

    // ==================================================
    // STATE GAME
    // ==================================================
    let level = 1;          // level sekarang
    let score = 0;          // skor pemain
    let lives = 3;          // nyawa
    let time = 60;          // waktu level
    let timer = null;       // interval timer
    let correct = [];       // jawaban urutan benar
    let dragItem = null;    // item yang sedang di drag
    let soundOn = true;     // status sound
    let isPaused = false;   // pause saat settings dibuka

    // ==================================================
    // AMBIL ELEMENT HTML
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

    // ==================================================
    // RESULT MODAL
    // ==================================================
    const result = document.getElementById("result");
    const resultTitle = document.getElementById("resultTitle");
    const retryBtn = document.getElementById("retryBtn");
    const nextBtn = document.getElementById("nextBtn");
    const settingsBtn = document.getElementById("settingsBtn");

    // ==================================================
    // AUDIO
    // ==================================================
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

        // cek nama pemain
        if(playerName.value.trim() === ""){
            alert("Enter your name first!");
            return;
        }

        // pindah dari home ke game
        home.classList.add("hidden");
        game.classList.remove("hidden");

        // reset data game
        level = 1;
        score = 0;
        lives = 3;

        // play backsound
        if(soundOn){
            bg.currentTime = 0;
            bg.play().catch(()=>{});
        }

        // load level pertama
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

        // =============================
        // BUAT SLOT JAWABAN
        // =============================
        correct.forEach(()=>{

            let s = document.createElement("div");
            s.className = "slot";

            // izinkan drop
            s.ondragover = e => e.preventDefault();

            // saat drop
            s.ondrop = ()=>{

                if(!dragItem) return;

                // kalau slot sudah ada isi
                if(s.firstChild){
                    steps.appendChild(s.firstChild);
                }

                s.appendChild(dragItem);
                dragItem = null;
            };

            slots.appendChild(s);
        });

        // =============================
        // BUAT STEP ACAK
        // =============================
        [...correct].sort(()=>Math.random()-0.5).forEach(text=>{

            let d = document.createElement("div");
            d.className = "step";
            d.innerText = text;
            d.draggable = true;

            // desktop drag
            d.ondragstart = ()=> dragItem = d;
            d.ondragend = ()=> dragItem = null;

            // ==================================
            // TOUCHSCREEN SUPPORT
            // ==================================

            // saat disentuh
            d.addEventListener("touchstart",()=>{
                dragItem = d;
            });

            // saat digeser
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

            // saat dilepas
            d.addEventListener("touchend",(e)=>{

                let t = e.changedTouches[0];
                let target = document.elementFromPoint(t.clientX,t.clientY);
                let slot = target?.closest(".slot");

                if(slot){

                    if(slot.firstChild){
                        steps.appendChild(slot.firstChild);
                    }

                    slot.appendChild(d);
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

            // pause saat settings dibuka
            if(isPaused) return;

            // waktu habis
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

        // =============================
        // JIKA BENAR
        // =============================
        if(benar){

            score += 10;
            level++;

            // level terakhir selesai
            if(level > levels.length){

                if(soundOn) winSound.play();

                showResult("win");
                updateUI();
                return;
            }

            // level biasa
            if(soundOn) nextSound.play();

            showResult("complete");
        }

        // =============================
        // JIKA SALAH
        // =============================
        else{

            // animasi getar
            document.querySelector(".board").classList.add("shake");

            setTimeout(()=>{
                document.querySelector(".board").classList.remove("shake");
            },300);

            lose();
        }

        updateUI();
    }

    // ==================================================
    // LOSE / KURANG NYAWA
    // ==================================================
    function lose(){

        lives--;

        // nyawa habis
        if(lives <= 0){

            if(soundOn){
                loseSound.currentTime = 0;
                loseSound.play().catch(()=>{});
            }

            showResult("lose");
        }

        // masih ada nyawa
        else{
            loadLevel();
        }

        updateUI();
    }

    // ==================================================
    // RESULT MODAL
    // ==================================================
    function showResult(type){

        clearInterval(timer);

        result.classList.remove("hidden");

        retryBtn.style.display = "none";
        nextBtn.style.display = "none";
        settingsBtn.style.display = "none";

        // level complete
        if(type === "complete"){
            resultTitle.innerText = "LEVEL COMPLETE 🎉";

            retryBtn.style.display = "block";
            settingsBtn.style.display = "block";
            nextBtn.style.display = "block";
        }

        // kalah
        if(type === "lose"){
            resultTitle.innerText = "YOU LOSE 😢";

            settingsBtn.style.display = "block";
            settingsBtn.innerText = "🔄 Retry";
            settingsBtn.onclick = ()=> location.reload();
        }

        // menang semua level
        if(type === "win"){
            resultTitle.innerText = "🏆 CONGRATULATIONS";

            settingsBtn.style.display = "block";
            settingsBtn.innerText = "🏠 Home";
            settingsBtn.onclick = ()=> location.reload();
        }
    }

    // ==================================================
    // BUTTON RESULT
    // ==================================================
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

        // toggle sound
        document.getElementById("soundBtn").onclick = ()=>{
            soundOn = !soundOn;
            bg.muted = !soundOn;
            openSettings();
        };

        // dark mode
        document.getElementById("themeBtn").onclick = ()=>{
            document.body.classList.toggle("dark");
        };

        // kembali home
        document.getElementById("homeBtn").onclick = ()=>{
            location.reload();
        };

        // tutup settings
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
    // BUTTON CLICK
    // ==================================================
    startBtn.addEventListener("click", startGame);
    checkBtn.addEventListener("click", checkAnswer);

    openSettingsHome.addEventListener("click", openSettings);
    openSettingsGame.addEventListener("click", openSettings);

    // ==================================================
    // KEYBOARD CONTROL
    // ==================================================
    document.addEventListener("keydown",(e)=>{

        // ENTER = Start / Check
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

        // S = buka / tutup settings (hanya saat game)
        if(e.key.toLowerCase() === "s" && !game.classList.contains("hidden")){

            if(settings.classList.contains("hidden")){
                openSettings();
            }else{
                closeSettings();
            }
        }
    });

    // ==================================================
    // AUTOPLAY SOUND SAAT USER KLIK PERTAMA
    // ==================================================
    document.body.addEventListener("click",()=>{

        if(soundOn){
            bg.play().catch(()=>{});
        }

    },{once:true});

});