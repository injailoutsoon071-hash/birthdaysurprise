/* ==========================================================================
   Easy customization
   ========================================================================== */
const CONFIG = {
	// Birthday target (local time). Example: Jan 30, 2026 at 00:00:00
	targetDate: new Date("2026-01-29T00:00:00"),
    // targetDate: new Date(Date.now() + 10_000), // TEST MODE: unlock after 10 seconds

	// Secret password (case-sensitive by default)
	password: "carter road",

	// Login hint
	hint: "Hint: Our first sunset 🌇",

	// Autoplay timing (ms)
	autoplayMs: 5200,

	// Gallery data (put images under /assets/images and update filenames)
	memories: [
		{
			src: "./assets/images/01.jpg",
			title: "The Beginning of Everything Beautiful",
			text: "the day we met for the first time(willingly), our first bike ride, our first sunset, our first hug, our first photo together again willingly😂"
		},
		{
			src: "./assets/images/02.jpg",
			title: "Journeys We Miss, Journeys We’ll Make",
			text: "I really do miss our bike rides, but nvm we'll make our bike journey's soon"
		},
		{
			src: "./assets/images/03.jpg",
			title: "Always You, Even on Busy Days",
			text: "as u mentioned this's gonna be us if we marry and I've got some work to do, but u need my attention as weel obv and it's my first job to give u attention😘"
		},
		{
			src: "./assets/images/04.jpg",
			title: "Learning You, Loving You",
			text: "confused me don't know what to do when u r pissed on me(u getting pissed on me is always valid, cuz I love that and you too)"
		}, 
		{
			src: "./assets/images/05.jpg",
			title: "Your Mini-Me ❤️",
			text: "u making me a mini version of u"
		},
		{
			src: "./assets/images/06.jpg",
			title: "An Allure I Can’t Escape",
			text: "the only word i can say is alluring while am engaged in mesmerising this moment"
		},
		{
			src: "./assets/images/07.jpg",
			title: "A Letter For You 🌻",
			text: `To Aarya,
From the day I saw u, I had a gut feeling that we have a connection def, our past selves wouldn’t believe that we will be having so much memories together. I still remember the day(April me after shaadi) where u had promised me we will meet and I was so sure that we will meet but we didn’t unfortunately. It’s completely okay cuz we’re meeting now that’s more important. We make mistakes in our past and we should learn from our mistakes but not just stick to them. Btw i still can’t believe the fact that we’re talking since one month, with u 1 hr is like 1 min. Our story is not less than a movie and if we ever try to reveal our story to anyone i don’t think so anyone would be able to understand. We just went with the flow and the flow took us deep into each other’s soul. U always care for me which is also the reason i call u mommy, lmao. I’ll just not narrate further story cuz u alrdy know what happened. So happiest birthday aarish’s mom😂, wishing u lots of joyfulness, love u and always will.
Your loved one,
vedya`
		}
	]
};

/* ==========================================================================
   Small helpers
   ========================================================================== */
const $ = (sel) => document.querySelector(sel);

const pad2 = (n) => String(Math.max(0, n)).padStart(2, "0");

function nowMs() {
	return Date.now();
}

function burstConfetti({
	particles = 160,
	spread = 72,
	startVelocity = 42,
	originY = 0.72
} = {}) {
	if (typeof confetti !== "function") return;

	confetti({
		particleCount: particles,
		spread,
		startVelocity,
		origin: { x: 0.5, y: originY },
		colors: ["#ff4fa3", "#ff2e63", "#ffffff", "#ffd1e7"]
	});
}

/* ==========================================================================
   Screens / navigation
   ========================================================================== */
const screens = {
	countdown: $("#screenCountdown"),
	wish: $("#screenWish"),
	login: $("#screenLogin"),
	gallery: $("#screenGallery")
};

function showScreen(name) {
	Object.entries(screens).forEach(([key, el]) => {
		const isActive = key === name;
		el.classList.toggle("screen--active", isActive);

		// NEW: hard-hide inactive screens to prevent overlap
		el.style.display = isActive ? "" : "none";
	});

	// Optional polish with GSAP if available
	if (window.gsap) {
		const el = screens[name];
		gsap.fromTo(
			el,
			{ opacity: 0, y: 14, filter: "blur(10px)" },
			{ opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }
		);
	}
}

/* ==========================================================================
   Countdown + Unlock logic
   ========================================================================== */
const cdDays = $("#cdDays");
const cdHours = $("#cdHours");
const cdMins = $("#cdMins");
const cdSecs = $("#cdSecs");

const btnLoginLocked = $("#btnLoginLocked");
const unlockText = $("#unlockText");
const lockedNote = $("#lockedNote");

let unlocked = false;
let countdownTimer = null;

function setLockedState(isLocked) {
	btnLoginLocked.disabled = isLocked;
	btnLoginLocked.classList.toggle("btn--locked", isLocked);
	btnLoginLocked.querySelector(".btn__icon").textContent = isLocked ? "🔒" : "💖";
	lockedNote.textContent = isLocked
		? "Locked until your birthday moment."
		: "Tap to continue.";
}

function updateCountdown() {
	const diff = CONFIG.targetDate.getTime() - nowMs();
    

	if (diff <= 0) {
		cdDays.textContent = "00";
		cdHours.textContent = "00";
		cdMins.textContent = "00";
		cdSecs.textContent = "00";

		if (!unlocked) {
			unlocked = true;
			clearInterval(countdownTimer);

			unlockText.textContent = "It’s finally your day 🎉💖";
			setLockedState(false);

			// confetti burst + tiny follow-up for cinematic feel
			burstConfetti({ particles: 190, spread: 78, startVelocity: 44, originY: 0.70 });
			setTimeout(() => burstConfetti({ particles: 90, spread: 58, startVelocity: 34, originY: 0.62 }), 260);

			tryAutoStartMusic();

			// NEW: go to wish page after unlock
			showScreen("wish");
		}
		return;
	}

	const totalSeconds = Math.floor(diff / 1000);
	const days = Math.floor(totalSeconds / (3600 * 24));
	const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
	const mins = Math.floor((totalSeconds % 3600) / 60);
	const secs = totalSeconds % 60;

	cdDays.textContent = pad2(days);
	cdHours.textContent = pad2(hours);
	cdMins.textContent = pad2(mins);
	cdSecs.textContent = pad2(secs);
}

/* ==========================================================================
   Music (optional)
   ========================================================================== */
const bgMusic = $("#bgMusic");

let hasAutoStartedMusic = false;
async function tryAutoStartMusic() {
	if (!bgMusic || hasAutoStartedMusic) return;
	hasAutoStartedMusic = true;
	try {
		bgMusic.muted = false;
		bgMusic.volume = 0.35; // CHANGED: safer default than 1
		await bgMusic.play();
	} catch {
		// Autoplay blocked; we'll retry on user gesture
		hasAutoStartedMusic = false;
	}
}

/* ==========================================================================
   Floating hearts canvas (lightweight)
   ========================================================================== */
const heartsCanvas = $("#heartsCanvas");
const hctx = heartsCanvas.getContext("2d");

let hearts = [];
let rafId = null;

function resizeCanvas() {
	const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
	heartsCanvas.width = Math.floor(window.innerWidth * dpr);
	heartsCanvas.height = Math.floor(window.innerHeight * dpr);
	hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function spawnHeart() {
	const w = window.innerWidth;
	const h = window.innerHeight;

	const size = 8 + Math.random() * 14;
	hearts.push({
		x: Math.random() * w,
		y: h + 20 + Math.random() * 80,
		size,
		speed: 0.5 + Math.random() * 1.4,
		drift: (Math.random() - 0.5) * 0.6,
		rot: Math.random() * Math.PI,
		rotSpd: (Math.random() - 0.5) * 0.01,
		alpha: 0.18 + Math.random() * 0.28
	});
}

function drawHeart(x, y, s, rot, alpha) {
	hctx.save();
	hctx.translate(x, y);
	hctx.rotate(rot);
	hctx.globalAlpha = alpha;

	// Simple heart path
	hctx.beginPath();
	hctx.moveTo(0, s * 0.35);
	hctx.bezierCurveTo(s * 0.5, -s * 0.2, s * 1.2, s * 0.45, 0, s * 1.15);
	hctx.bezierCurveTo(-s * 1.2, s * 0.45, -s * 0.5, -s * 0.2, 0, s * 0.35);
	hctx.closePath();

	const grad = hctx.createLinearGradient(-s, -s, s, s);
	grad.addColorStop(0, "rgba(255,79,163,.95)");
	grad.addColorStop(1, "rgba(255,46,99,.85)");
	hctx.fillStyle = grad;
	hctx.fill();
	hctx.restore();
}

function animateHearts() {
	const w = window.innerWidth;
	const h = window.innerHeight;

	hctx.clearRect(0, 0, w, h);

	// keep density stable
	if (hearts.length < 36 && Math.random() < 0.75) spawnHeart();

	hearts = hearts.filter((p) => {
		p.y -= p.speed;
		p.x += p.drift;
		p.rot += p.rotSpd;
		drawHeart(p.x, p.y, p.size, p.rot, p.alpha);
		return p.y > -40;
	});

	rafId = requestAnimationFrame(animateHearts);
}

/* ==========================================================================
   Login logic
   ========================================================================== */
const passwordInput = $("#passwordInput");
const passwordHint = $("#passwordHint");
const loginError = $("#loginError");
const btnLogin = $("#btnLogin");
const backToCountdown = $("#backToCountdown");

function softError(msg) {
	loginError.textContent = msg;
	const card = $(".card");
	card.classList.remove("shake");
	// retrigger animation
	void card.offsetWidth;
	card.classList.add("shake");
}

function heartExplosion() {
	// Use confetti to simulate heart-like burst with romantic palette
	burstConfetti({ particles: 120, spread: 86, startVelocity: 38, originY: 0.62 });
	setTimeout(() => burstConfetti({ particles: 90, spread: 74, startVelocity: 32, originY: 0.58 }), 180);
}

function isPasswordCorrect(input) {
	return input === CONFIG.password;
}

/* ==========================================================================
   Gallery logic
   ========================================================================== */
const galleryBg = $("#galleryBg");
const memoryImg = $("#memoryImg");
const memoryTitle = $("#memoryTitle");
const memoryText = $("#memoryText");
const prevBtn = $("#prevBtn");
const nextBtn = $("#nextBtn");
const toggleAutoplayBtn = $("#toggleAutoplay");
const restartBtn = $("#restart");

let idx = 0;
let autoplay = false;
let autoplayTimer = null;
let galleryFirstLoad = true;

function setMemory(i) {
	const m = CONFIG.memories[i];
	if (!m) return;

	// preload-ish: set bg first for smoother transition
	galleryBg.style.backgroundImage = `url('${m.src}')`;

	// Image swap with fade polish (GSAP optional)
	const swap = () => {
		memoryImg.src = m.src;

		const hasTitle = typeof m.title === "string" && m.title.trim().length > 0;
		const hasText = typeof m.text === "string" && m.text.trim().length > 0;
		const hasCaption = hasTitle || hasText;

		// Hide caption + show full image when there's no description (e.g. 07.jpg)
		memoryImg.classList.toggle("memory__img--contain", !hasCaption);

		memoryTitle.textContent = hasTitle ? m.title : "";
		memoryText.textContent = hasText ? m.text : "";

		const captionEl = memoryTitle.closest(".memory__caption");
		if (captionEl) captionEl.style.display = hasCaption ? "" : "none";

		 // NEW: special split layout only for the last slide (07.jpg)
		const isLast = i === CONFIG.memories.length - 1;
		document.body.classList.toggle("is-letter-memory", isLast);
	};

	if (window.gsap) {
		gsap.to([memoryImg, memoryTitle, memoryText], {
			opacity: 0,
			y: 8,
			duration: 0.25,
			ease: "power2.out",
			onComplete: () => {
				swap();
				gsap.to([memoryImg, memoryTitle, memoryText], { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" });
			}
		});
	} else {
		swap();
	}
}

function next() {
	idx = (idx + 1) % CONFIG.memories.length;
	setMemory(idx);
}

function prev() {
	idx = (idx - 1 + CONFIG.memories.length) % CONFIG.memories.length;
	setMemory(idx);
}

function setAutoplay(on) {
	autoplay = on;
	toggleAutoplayBtn.setAttribute("aria-pressed", String(on));
	clearInterval(autoplayTimer);
	if (on) autoplayTimer = setInterval(next, CONFIG.autoplayMs);
}

/* ==========================================================================
   Wiring
   ========================================================================== */
function init() {
	// Hint
	passwordHint.textContent = CONFIG.hint;

	// Countdown
	setLockedState(true);
	updateCountdown();
	countdownTimer = setInterval(updateCountdown, 1000);

	// Hearts canvas
	resizeCanvas();
	window.addEventListener("resize", resizeCanvas);
	animateHearts();

	// Countdown -> Login (only when unlocked)
	btnLoginLocked.addEventListener("click", () => {
		if (!unlocked) return;
		showScreen("login");
		passwordInput.focus();
	});

	// NEW: if autoplay is blocked, start music on the first user interaction anywhere
	const onFirstGesture = () => {
		tryAutoStartMusic();
		window.removeEventListener("pointerdown", onFirstGesture, true);
		window.removeEventListener("keydown", onFirstGesture, true);
	};
	window.addEventListener("pointerdown", onFirstGesture, true);
	window.addEventListener("keydown", onFirstGesture, true);

	// NEW: retry when user clicks Continue on wish page (counts as a gesture)
	const btnWishContinue = $("#btnWishContinue");
	btnWishContinue?.addEventListener("click", () => {
		if (!unlocked) return;
		tryAutoStartMusic();
		showScreen("login");
		passwordInput.focus();
	});

	// Login actions
	backToCountdown.addEventListener("click", () => showScreen("countdown"));

	btnLogin.addEventListener("click", () => {
		loginError.textContent = "";
		const val = passwordInput.value || "";

		if (!isPasswordCorrect(val)) {
			softError("That doesn’t feel right… try again, love.");
			return;
		}

		heartExplosion();
		if (window.gsap) {
			gsap.to("#screenLogin", { opacity: 0, y: 10, duration: 0.35, ease: "power2.out", onComplete: () => showScreen("gallery") });
		} else {
			showScreen("gallery");
		}

		// Gallery first load effects
		setTimeout(() => {
			if (galleryFirstLoad) {
				galleryFirstLoad = false;
				burstConfetti({ particles: 220, spread: 92, startVelocity: 46, originY: 0.68 });
			}
			idx = 0;
			setMemory(idx);
		}, 80);
	});

	passwordInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") btnLogin.click();
	});

	// Gallery controls
	nextBtn.addEventListener("click", next);
	prevBtn.addEventListener("click", prev);
	toggleAutoplayBtn.addEventListener("click", () => setAutoplay(!autoplay));
	restartBtn.addEventListener("click", () => {
		setAutoplay(false);
		idx = 0;
		setMemory(idx);
		burstConfetti({ particles: 120, spread: 70, startVelocity: 34, originY: 0.72 });
	});

	// Prime gallery UI with first memory bg (in case user opens quickly after unlock)
	if (CONFIG.memories[0]) galleryBg.style.backgroundImage = `url('${CONFIG.memories[0].src}')`;
}

init();
