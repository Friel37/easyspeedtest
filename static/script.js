// DOM Elements
const startButton = document.getElementById('startButton');
const buttonText = document.getElementById('buttonText');
const statusText = document.getElementById('statusText');
const serverText = document.getElementById('serverText');
const progressBar = document.getElementById('progressBar');
const speedDisplay = document.getElementById('speedDisplay');
const speedLabel = document.getElementById('speedLabel');
const speedArc = document.getElementById('speedArc');
const pingValue = document.getElementById('pingValue');
const downloadValue = document.getElementById('downloadValue');
const uploadValue = document.getElementById('uploadValue');
const serverInfo = document.getElementById('serverInfo');
const pingQuality = document.getElementById('pingQuality');
const downloadQuality = document.getElementById('downloadQuality');
const uploadQuality = document.getElementById('uploadQuality');
const pingBar = document.getElementById('pingBar');
const downloadBar = document.getElementById('downloadBar');
const uploadBar = document.getElementById('uploadBar');

let pollInterval = null;
let speedChart = null;
let chartData = {
    labels: [],
    download: [],
    upload: []
};

// Initialize Chart
function initChart() {
    const ctx = document.getElementById('speedChart').getContext('2d');
    speedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Download',
                    data: chartData.download,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0
                },
                {
                    label: 'Upload',
                    data: chartData.upload,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 11,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        callback: function(value) {
                            return value + ' Mbps';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Initialize on page load
initChart();

// Quality assessment functions
function getPingQuality(ping) {
    if (ping < 20) return { text: 'Excellent', percent: 100 };
    if (ping < 50) return { text: 'Good', percent: 75 };
    if (ping < 100) return { text: 'Fair', percent: 50 };
    return { text: 'Poor', percent: 25 };
}

function getSpeedQuality(speed) {
    if (speed > 100) return { text: 'Excellent', percent: 100 };
    if (speed > 50) return { text: 'Good', percent: 75 };
    if (speed > 25) return { text: 'Fair', percent: 50 };
    if (speed > 10) return { text: 'Slow', percent: 30 };
    return { text: 'Very Slow', percent: 15 };
}

// Animate number counter
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// Update speedometer arc
function updateSpeedometer(speed) {
    const maxSpeed = 500; // Max speed for visualization
    const normalizedSpeed = Math.min(speed, maxSpeed);
    const arcLength = 377;
    const offset = arcLength - (normalizedSpeed / maxSpeed * arcLength);
    
    gsap.to(speedArc, {
        strokeDashoffset: offset,
        duration: 0.8,
        ease: "power2.out"
    });
    
    // Animate the number
    const currentSpeed = parseInt(speedDisplay.textContent) || 0;
    gsap.to({ val: currentSpeed }, {
        val: speed,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: function() {
            speedDisplay.textContent = Math.round(this.targets()[0].val);
        }
    });
}

// Add data point to chart
function addChartDataPoint(download, upload) {
    const timestamp = new Date().toLocaleTimeString();
    
    if (chartData.labels.length > 20) {
        chartData.labels.shift();
        chartData.download.shift();
        chartData.upload.shift();
    }
    
    chartData.labels.push(timestamp);
    chartData.download.push(download || 0);
    chartData.upload.push(upload || 0);
    
    speedChart.update('none');
}

// Reset UI
function resetUI() {
    speedDisplay.textContent = '0';
    speedLabel.textContent = 'Testing...';
    statusText.textContent = 'Initializing...';
    progressBar.style.width = '0%';
    
    pingValue.textContent = '--';
    downloadValue.textContent = '--';
    uploadValue.textContent = '--';
    
    pingQuality.textContent = '--';
    downloadQuality.textContent = '--';
    uploadQuality.textContent = '--';
    
    pingBar.style.width = '0%';
    downloadBar.style.width = '0%';
    uploadBar.style.width = '0%';
    
    serverInfo.innerHTML = '<p class="text-gray-400">Connecting...</p>';
    serverText.textContent = '';
    
    // Reset chart
    chartData.labels = [];
    chartData.download = [];
    chartData.upload = [];
    speedChart.update();
    
    updateSpeedometer(0);
}

// Start test
startButton.addEventListener('click', async () => {
    if (startButton.disabled) return;
    
    // Clear any existing poll interval
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    
    resetUI();
    
    startButton.disabled = true;
    buttonText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Testing...';
    
    try {
        const response = await fetch('/api/start-test', {
            method: 'POST'
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to start test');
        }
        
        pollInterval = setInterval(pollStatus, 300);
        
    } catch (error) {
        showError('Failed to start test: ' + error.message);
        resetButton();
    }
});

// Poll for status
async function pollStatus() {
    try {
        const response = await fetch('/api/status');
        
        if (!response.ok) {
            throw new Error('Server error');
        }
        
        const data = await response.json();
        
        updateUI(data);
        
        if (data.status === 'completed' || data.status === 'error') {
            clearInterval(pollInterval);
            pollInterval = null;
            
            // Small delay to ensure final update is rendered
            setTimeout(() => {
                resetButton();
                
                if (data.status === 'error') {
                    showError(data.error || 'An error occurred');
                } else {
                    showSuccess();
                }
            }, 500);
        }
        
    } catch (error) {
        // Only show error if we haven't already stopped polling
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
            showError('Connection error: ' + error.message);
            resetButton();
        }
    }
}

// Update UI with status
function updateUI(data) {
    const statusMap = {
        'starting': { text: 'Initializing test...', progress: 5 },
        'finding_server': { text: 'Finding optimal server...', progress: 15 },
        'testing_ping': { text: 'Testing latency...', progress: 30 },
        'testing_download': { text: 'Testing download speed...', progress: 50 },
        'testing_upload': { text: 'Testing upload speed...', progress: 80 },
        'completed': { text: 'Test completed!', progress: 100 },
        'error': { text: 'Error occurred', progress: 0 }
    };
    
    const status = statusMap[data.status] || { text: data.status, progress: 0 };
    statusText.textContent = status.text;
    progressBar.style.width = status.progress + '%';
    speedLabel.textContent = status.text;
    
    // Update server info
    if (data.server) {
        serverInfo.innerHTML = `
            <div class="space-y-1">
                <p class="font-semibold text-gray-800">${data.server.sponsor}</p>
                <p class="text-xs text-gray-500">${data.server.name}, ${data.server.country}</p>
            </div>
        `;
        serverText.textContent = data.server.name;
    }
    
    // Update ping
    if (data.ping !== null) {
        const quality = getPingQuality(data.ping);
        pingValue.textContent = data.ping;
        pingQuality.textContent = quality.text;
        pingBar.style.width = quality.percent + '%';
        
        gsap.to(pingValue, {
            scale: 1.1,
            duration: 0.2,
            yoyo: true,
            repeat: 1
        });
    }
    
    // Update download
    if (data.download !== null) {
        const quality = getSpeedQuality(data.download);
        downloadValue.textContent = data.download;
        downloadQuality.textContent = quality.text;
        downloadBar.style.width = quality.percent + '%';
        
        if (data.status === 'testing_download') {
            updateSpeedometer(data.download);
            addChartDataPoint(data.download, 0);
        }
        
        gsap.to(downloadValue, {
            scale: 1.1,
            duration: 0.2,
            yoyo: true,
            repeat: 1
        });
    }
    
    // Update upload
    if (data.upload !== null) {
        const quality = getSpeedQuality(data.upload);
        uploadValue.textContent = data.upload;
        uploadQuality.textContent = quality.text;
        uploadBar.style.width = quality.percent + '%';
        
        if (data.status === 'testing_upload' || data.status === 'completed') {
            updateSpeedometer(data.upload);
            addChartDataPoint(data.download || 0, data.upload);
        }
        
        gsap.to(uploadValue, {
            scale: 1.1,
            duration: 0.2,
            yoyo: true,
            repeat: 1
        });
    }
}

// Reset button
function resetButton() {
    startButton.disabled = false;
    buttonText.innerHTML = '<i class="fas fa-play-circle mr-2"></i>Start Speed Test';
    speedometer.classList.remove('testing');
}

// Show error
function showError(message) {
    statusText.textContent = 'Error: ' + message;
    statusText.classList.add('text-red-600');
    speedLabel.textContent = 'Test failed';
    progressBar.style.width = '0%';
}

// Show success
function showSuccess() {
    gsap.to(speedDisplay, {
        scale: 1.2,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
    });
    
    statusText.classList.remove('text-red-600');
    statusText.classList.add('text-green-600');
    statusText.textContent = 'Test completed successfully!';
}
