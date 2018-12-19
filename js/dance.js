new p5();

var mic, fft, spectrum;
var dancer, dancerId;

var filter, noise;

var N = 0;

var peeks = {};
var peekDeltas = {};

var leader = 0;

var noiseStart, noiseEnd;

var width = 700;
var height = 400;

var micToggle = true;
var groupComplete = false;

document.getElementById("stage").onload = function() {

	dancer = document.getElementById("dancer");
	dancerId = parseInt(dancer.getAttribute("dancerId"));

	noiseStart = dancerId * width/32;
	noiseEnd = dancerId * width/32 + width/32;

	peeks[dancerId] = 0;

	setTimeout( function() {
		setInterval( function() {
			discoverPeers();
		}, 1000);
	}, 2000);

	console.log("I am on stage, dancer ", dancerId);

};

function micOff() {
	if (micToggle) {
		mic.stop();
		micToggle = false;
	} else {
		mic.start();
		micToggle = true;
	}
}

function discoverPeers() {
	var peek;
	for (i = 0; i < 32; i ++) {
		peek = Math.abs(spectrum[i]);
		if (N < 31) {
			if (peeks[i] == undefined) {
				if (peek > 140) {
					peeks[i] = peek;
					N ++;
					if (N == 2) { groupComplete = true; }
					noiseStart = Math.min(noiseStart, i * width/32);
					noiseEnd = Math.max(noiseEnd, i * width/32 + width/32);
					break;
				}
			}
		}
	}
}

function setup() {

	createCanvas(700,400);
	noFill();

	filter = new p5.BandPass();
	noise = new p5.Noise();
	noise.disconnect();
	filter.process(noise);
	noise.start();

	mic = new p5.AudioIn();
	mic.start();
	fft = new p5.FFT();
	fft.setInput(mic);

}

function draw() {	

	if ((mouseY < 400) && (mouseY > 30) && (mouseX > noiseStart) && (mouseX < noiseEnd)) {
		noise.amp(1);
		filterFreq = map(mouseX, 0, width, 10, 22050);
		filterWidth = map(mouseY, 0, height, 0, 90);
		filter.set(filterFreq, filterWidth);
	} else {
		noise.amp(0);
	}

	fft.analyze();
	spectrum = fft.linAverages(32);

	background(0);
	noStroke();

	beginShape();
	if (groupComplete) {
		fill(255, 0, 0);
	} else  {
		fill(0, 255, 0);
	}

	for (i = 0; i < Object.keys(peeks).length; i ++) {
		j = Object.keys(peeks)[i];
		var x = map(j, 0, spectrum.length, 0, width);
		var h = -height + map(spectrum[j], 0, 255, height, 0);
		rect(x, height, width / 32, h);
	}
	endShape();
}






