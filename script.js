/* --- CẤU HÌNH --- */
const CONFIG = {
    // Cấu trúc: Tiêu đề | Nội dung (dùng <br> để xuống dòng) | Lời kết
    loveText: "Chúc mừng sinh nhật!|Mỗi khoảnh khắc bên em đều là <br> một món quà vô giá. | Anh yêu em rất nhiều😘",
    startDate: "2025-11-20", // Thay ngày yêu của bạn
    musicVolume: 0.5
};

/* --- DANH SÁCH ẢNH --- */
const myImages = [
  "img/my.jpg", "img/my1.jpg", "img/my2.jpg", "img/my3.jpg", 
  "img/my4.jpg", "img/my5.jpg", "img/my6.jpg", "img/my7.jpg",
  "img/my8.jpg", "img/my9.jpg", "img/my10.jpg", "img/my11.jpg"
];

const balloonImages = [
  "img/balloonred.png", "img/balloonpurple.png", 
  "img/balloongreen.png", "img/balloonyellow.png", "img/balloonorange.png"
];

/* --- ELEMENTS --- */
const giftBox = document.getElementById("giftBox");
const giftContainer = document.getElementById("giftContainer");
const screen1 = document.getElementById("screen1");
const balloonsContainer = document.getElementById("balloons");
const bgMusic = document.getElementById("bgMusic");

// Overlay Elements
const letterOverlay = document.getElementById("letterOverlay");
const envelopeContainer = document.getElementById("envelopeContainer");
const closedImg = document.getElementById("closedImg");
const openedImg = document.getElementById("openedImg");
const letterBox = document.getElementById("letter");
const typewriter = document.getElementById("typewriter");
const daysCounter = document.getElementById("daysCounter");

let balloonInterval;
let hasOpened = false;

// Biến cho tính năng kéo thả
let isDragging = false;
let hasMoved = false;

/* --- GỌI HÀM TẠO TÍNH NĂNG KÉO THẢ --- */
makeDraggable(envelopeContainer);

/* --- 1. LOGIC BÓNG BAY --- */
function createBalloon() {
    const balloon = document.createElement("img");
    balloon.className = "balloon";
    balloon.src = balloonImages[Math.floor(Math.random() * balloonImages.length)];
    
    balloon.style.left = Math.random() * 100 + "vw";
    balloon.style.animationDuration = (8 + Math.random() * 5) + "s";
    const size = 60 + Math.random() * 40;
    balloon.style.width = size + "px";
    
    balloonsContainer.appendChild(balloon);
    setTimeout(() => { balloon.remove(); }, 13000);
}
balloonInterval = setInterval(createBalloon, 800);

/* --- 2. LOGIC MỞ HỘP QUÀ --- */
giftBox.addEventListener("click", () => {
    if (hasOpened) return;
    hasOpened = true;

    // Phát nhạc
    bgMusic.volume = CONFIG.musicVolume;
    bgMusic.play().catch(() => console.log("Audio blocked"));

    // Ẩn hộp quà
    giftContainer.style.opacity = "0";
    setTimeout(() => giftContainer.remove(), 500);
    //clearInterval(balloonInterval);

    // Nổ tim
    let burstCount = 0;
    const burstInterval = setInterval(() => {
        launchHearts();
        burstCount++;
        if(burstCount > 5) clearInterval(burstInterval);
    }, 300);

    // Hiện ảnh Polaroid
    startWindowsSequence();

    // Hẹn giờ hiện Phong Bì (12 giây sau)
    setTimeout(() => {
        letterOverlay.classList.remove("hidden");
    }, 12000);
});

/* --- 3. LOGIC MỞ PHONG BÌ --- */
envelopeContainer.addEventListener("click", (e) => {
    // Nếu vừa mới kéo di chuyển xong thì KHÔNG mở thư
    if (hasMoved) {
        hasMoved = false;
        return; 
    }

    if (envelopeContainer.classList.contains("opened")) return;
    envelopeContainer.classList.add("opened");

    closedImg.classList.add("hidden");
    openedImg.classList.remove("hidden");

    setTimeout(() => {
        openedImg.classList.add("fade-out-up");
    }, 1000);

    setTimeout(() => {
        envelopeContainer.style.display = "none";
        letterBox.classList.remove("hidden");
        setTimeout(() => letterBox.classList.add("show"), 50);
        
        // Kích hoạt hiệu ứng gõ chữ
        typeWriterEffect(CONFIG.loveText, typewriter);
        
        const days = Math.floor((new Date() - new Date(CONFIG.startDate)) / (86400000));
        daysCounter.innerText = `Chúng ta đã bên nhau ${days} ngày 💕`;
    }, 1500);
});

/* --- 4. LOGIC ĐÓNG THƯ --- */
letterBox.addEventListener("click", () => {
    letterBox.classList.remove("show");

    setTimeout(() => {
        letterBox.classList.add("hidden");
        
        // Hiện lại và Reset phong bì
        envelopeContainer.style.display = "flex";
        envelopeContainer.classList.remove("opened");
        
        openedImg.classList.add("hidden");
        openedImg.classList.remove("fade-out-up");
        closedImg.classList.remove("hidden");
        
        // Xóa nội dung cũ để lần sau mở ra gõ lại từ đầu
        typewriter.innerHTML = ""; 
        
    }, 500);
});

/* --- 5. HÀM HIỆU ỨNG GÕ CHỮ (QUAN TRỌNG ĐÃ SỬA) --- */
function typeWriterEffect(text, el) {
    const parts = text.split('|'); // Tách 3 phần
    el.innerHTML = ""; // Xóa nội dung cũ

    // Tạo các khung chứa sẵn
    const mainTitle = document.createElement("h2");
    mainTitle.className = "letter-main-title";
    
    const bodyText = document.createElement("p");
    bodyText.className = "letter-body";
    
    const subTitle = document.createElement("div");
    subTitle.className = "letter-subtitle";

    el.appendChild(mainTitle);
    el.appendChild(bodyText);
    el.appendChild(subTitle);

    // Bắt đầu chuỗi gõ chữ: Tiêu đề -> Thân bài -> Lời kết
    typeString(mainTitle, parts[0].trim(), 50, () => {
        typeString(bodyText, parts[1].trim(), 30, () => {
            typeString(subTitle, parts[2].trim(), 50);
        });
    });
}

// Hàm hỗ trợ gõ từng ký tự (xử lý cả thẻ <br>)
function typeString(element, text, speed, callback) {
    let i = 0;
    function type() {
        if (i < text.length) {
            // Nếu gặp thẻ <br> thì chèn luôn cả thẻ, không gõ từng chữ
            if (text.substring(i, i + 4) === "<br>") {
                element.innerHTML += "<br>";
                i += 4;
            } else {
                element.innerHTML += text.charAt(i);
                i++;
            }
            setTimeout(type, speed);
        } else {
            // Gõ xong thì gọi hàm callback (để gõ tiếp phần sau)
            if (callback) callback();
        }
    }
    type();
}

/* --- CÁC HÀM HỖ TRỢ KHÁC --- */
function launchHearts() {
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement("div");
        heart.innerText = Math.random() > 0.5 ? "💖" : "🌸";
        heart.className = "heart";
        const x = (Math.random() - 0.5) * window.innerWidth * 1.5 + "px";
        const y = (Math.random() - 0.5) * window.innerHeight * 1.5 + "px";
        heart.style.setProperty("--x", x);
        heart.style.setProperty("--y", y);
        screen1.appendChild(heart);
        setTimeout(() => heart.remove(), 2000);
    }
}

function startWindowsSequence() {
    const positions = generateGridPositions(myImages.length);
    let index = 0;
    const interval = setInterval(() => {
        if (index >= myImages.length) {
            clearInterval(interval);
            return;
        }
        const pos = positions[index];
        createWindow(myImages[index], index, pos.x, pos.y);
        index++;
    }, 600);
}

function generateGridPositions(count) {
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const cellW = window.innerWidth / cols;
    const cellH = window.innerHeight / rows;
    let positions = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const offsetX = (Math.random() - 0.5) * 50;
            const offsetY = (Math.random() - 0.5) * 50;
            positions.push({
                x: c * cellW + cellW / 2 + offsetX,
                y: r * cellH + cellH / 2 + offsetY
            });
        }
    }
    return positions.sort(() => Math.random() - 0.5);
}

function createWindow(src, idx, finalX, finalY) {
    const win = document.createElement("div");
    win.className = "window";
    
    // Click vào ảnh để nổi lên trên cùng
    win.onclick = function() {
        document.querySelectorAll('.window').forEach(w => w.style.zIndex = "15");
        this.style.zIndex = "100";
    };

    // Bạn có thể sửa tên ảnh tại đây
    win.innerHTML = `<img src="${src}" alt="Memory"><div class="window-title">Xinh gái😍</div>`;
    screen1.appendChild(win);

    const startX = window.innerWidth / 2 - 65;
    const startY = window.innerHeight / 2 - 80;

    win.style.left = startX + "px";
    win.style.top = startY + "px";
    win.style.transform = "scale(0)";
    win.style.opacity = "0";

    setTimeout(() => {
        win.style.transition = "top 3s ease-out, left 3s ease-out, transform 3s ease-out, opacity 2s";
        win.style.left = (finalX - 65) + "px";
        win.style.top = (finalY - 80) + "px";
        const rotate = (Math.random() - 0.5) * 30;
        win.style.transform = `scale(1) rotate(${rotate}deg)`;
        win.style.opacity = "1";
    }, 50);
}

/* --- LOGIC KÉO THẢ (DRAG & DROP) --- */
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    element.onmousedown = dragMouseDown;
    element.ontouchstart = dragTouchStart;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        hasMoved = false;

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        hasMoved = true;

        element.style.position = 'absolute'; 
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    function dragTouchStart(e) {
        const touch = e.touches[0];
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        hasMoved = false;

        document.ontouchend = closeDragElement;
        document.ontouchmove = elementTouchDrag;
    }

    function elementTouchDrag(e) {
        const touch = e.touches[0];
        pos1 = pos3 - touch.clientX;
        pos2 = pos4 - touch.clientY;
        
        if (Math.abs(pos1) > 1 || Math.abs(pos2) > 1) {
            hasMoved = true;
        }

        pos3 = touch.clientX;
        pos4 = touch.clientY;

        element.style.position = 'absolute';
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
}