let isRecording = false;
let mediaRecorder;

let recordBtn = document.querySelector(".record-btn");
let stopBtn = document.querySelector(".stop-btn");
let saveBtn = document.querySelector(".save-btn");
let video = document.querySelector("video");

recordBtn.addEventListener("click", async () => {
	let stream = await navigator.mediaDevices.getDisplayMedia({
		video: true,
		audio: true,
	});
	const mime = MediaRecorder.isTypeSupported("video/webm; codecs=h264")
		? "video/webm; codecs=h264"
		: "video/webm";
	mediaRecorder = new MediaRecorder(stream, {
		mimeType: mime,
	});
	let chunks = [];
	mediaRecorder.addEventListener("dataavailable", (e) => {
		chunks.push(e.data);
	});
	mediaRecorder.addEventListener("stop", () => {
		isRecording = false;
		mediaRecorder.stream.getTracks().forEach((track) => track.stop());
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
	a.download = `screen-recording-${new Date().getTime()}.webm`;
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
