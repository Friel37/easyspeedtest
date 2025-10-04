# ⚡ Easy SpeedTest

A clean, modern web-based internet speed test application built with Python Flask and vanilla JavaScript. Uses Ookla's Speedtest network for accurate and reliable results.

## Features

- 🚀 **Fast & Accurate** - Uses official Speedtest.net servers
- 📊 **Real-time Results** - Live updates during testing with animated graphs
- 🎨 **Professional UI** - Built with Tailwind CSS and GSAP animations
- 📈 **Live Charts** - Real-time speed visualization with Chart.js
- 📶 **Complete Testing** - Ping, Download, and Upload speeds with quality indicators
- 🌍 **Auto Server Selection** - Automatically finds the best server
- 📱 **Fully Responsive** - Beautiful design on all devices
- ⚡ **Smooth Animations** - Professional transitions and effects

## UI Components

The app features:
- **Large speedometer arc** with animated speed display
- **Real-time line chart** showing download/upload speeds over time
- **Professional stat cards** for Ping, Download, and Upload with quality ratings
- **Progress bar** showing test stages
- **Server information card** with detailed connection info
- **Smooth animations** powered by GSAP

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Setup

1. **Clone or download this repository**

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

Or install manually:

```bash
pip install Flask flask-cors speedtest-cli
```

## Usage

1. **Start the server**

```bash
python app.py
```

2. **Open your browser**

Navigate to: `http://localhost:5000`

3. **Run a speed test**

Click the "Start Test" button and watch the magic happen!

## How It Works

### Backend (Python Flask)
- **Flask** - Web framework for serving the app and API
- **speedtest-cli** - Python library that connects to Ookla's Speedtest network
- **Threading** - Runs speed tests in background to keep API responsive

### Frontend (HTML/CSS/JavaScript)
- **Tailwind CSS** - Modern utility-first CSS framework
- **Chart.js** - Beautiful real-time speed charts
- **GSAP** - Professional animation library
- **Font Awesome** - Icon library
- Vanilla JavaScript for API communication
- Real-time polling for live updates

### API Endpoints

- `GET /` - Serves the main web interface
- `POST /api/start-test` - Starts a new speed test
- `GET /api/status` - Returns current test status and results

## Configuration

The server runs on port 5000 by default. To change this, edit `app.py`:

```python
app.run(debug=True, host='0.0.0.0', port=YOUR_PORT)
```

## Deployment

### Local Network
Already configured to accept connections from your local network (`host='0.0.0.0'`)

### Cloud Deployment
Can be deployed to:
- **Heroku** - Add `Procfile`: `web: python app.py`
- **Railway** - Will auto-detect Flask app
- **Render** - Use Python environment
- **PythonAnywhere** - Follow their Flask deployment guide

## Technology Stack

- **Backend**: Python 3, Flask, speedtest-cli
- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+)
- **Libraries**: Chart.js (graphs), GSAP (animations), Font Awesome (icons)
- **Design**: Professional glass-morphism UI with gradient accents
- **Network**: Ookla's Speedtest global server network

## Troubleshooting

### "Module not found" error
Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Speed test taking too long
This is normal for the first run. The library needs to:
1. Find the best server
2. Test ping
3. Download test files
4. Upload test data

### Port already in use
Change the port in `app.py` or stop the process using port 5000

## License

Free to use and modify for personal and commercial projects.

## Credits

- Speed test powered by [Ookla's Speedtest Network](https://www.speedtest.net/)
- Built with ❤️ using Flask and Python

---

**Enjoy testing your internet speed!** 🚀

