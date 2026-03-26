let isRecording = false;
let mediaRecorder;
let fileExtension = "webm";

let recordBtn = document.querySelector(".record-btn");
let stopBtn = document.querySelector(".stop-btn");
let saveBtn = document.querySelector(".save-btn");
let video = document.querySelector("video");

recordBtn.addEventListener("click", async () => {
	let displayStream = await navigator.mediaDevices.getDisplayMedia({
		video: true,
		audio: true,
	});

	let voiceStream = null;
	try {
		voiceStream = await navigator.mediaDevices.getUserMedia({
			audio: true,
			video: false,
		});
	} catch (e) {
		console.warn("Microphone not available or permission denied");
	}

	let audioContext = new AudioContext();
	let dest = audioContext.createMediaStreamDestination();

	if (displayStream.getAudioTracks().length > 0) {
		audioContext.createMediaStreamSource(displayStream).connect(dest);
	}
	if (voiceStream && voiceStream.getAudioTracks().length > 0) {
		audioContext.createMediaStreamSource(voiceStream).connect(dest);
	}

	let stream = new MediaStream([
		...displayStream.getVideoTracks(),
		...dest.stream.getAudioTracks(),
	]);

	let allTracks = [...displayStream.getTracks()];
	if (voiceStream) {
		allTracks.push(...voiceStream.getTracks());
	}
	let mime = "video/webm";
	if (MediaRecorder.isTypeSupported("video/mp4")) {
		mime = "video/mp4";
		fileExtension = "mp4";
	} else if (MediaRecorder.isTypeSupported("video/webm; codecs=h264")) {
		mime = "video/webm; codecs=h264";
		fileExtension = "webm";
	}
	mediaRecorder = new MediaRecorder(stream, {
		mimeType: mime,
	});
	let chunks = [];
	mediaRecorder.addEventListener("dataavailable", (e) => {
		chunks.push(e.data);
	});
	mediaRecorder.addEventListener("stop", () => {
		isRecording = false;
		allTracks.forEach((track) => track.stop());
		if (audioContext.state !== "closed") {
			audioContext.close();
		}
		let blob = new Blob(chunks, {
			type: chunks[0].type,
		});
		let url = URL.createObjectURL(blob);
		video.src = url;
		video.controls = true;
		video.autoplay = true;
		video.style.display = "block";
	});
	mediaRecorder.start();
	isRecording = true;
	recordBtn.classList.add("dispn");
	stopBtn.classList.remove("dispn");
	saveBtn.classList.add("dispn");
});

stopBtn.addEventListener("click", () => {
	mediaRecorder.stop();
	stopBtn.classList.add("dispn");
	saveBtn.classList.remove("dispn");
});

saveBtn.addEventListener("click", () => {
	let a = document.createElement("a");
	a.href = document.querySelector("video").src;
	const date = new Date()
		.toLocaleString()
		.replace(/:/g, "-")
		.replaceAll("/", "-")
		.replace("T", "-")
		.replace(", ", "-")
		.split(".")[0];
	a.download = `kaptured-${date}.${fileExtension}`;
	video.pause();
	video.currentTime = 0;
	video.src = "";
	video.style.display = "none";
	recordBtn.classList.remove("dispn");
	stopBtn.classList.add("dispn");
	saveBtn.classList.add("dispn");
	a.click();
});

let a = new Date();
if (a.getHours() >= 20 || a.getHours() <= 7) {
	document.body.dataset.theme = "dark";
} else {
	document.body.dataset.theme = "light";
}
