from flask import Flask, render_template, jsonify
from flask_cors import CORS
import speedtest
import threading

app = Flask(__name__)
CORS(app)

# Store the current test results
current_test = {
    'status': 'idle',
    'ping': None,
    'download': None,
    'upload': None,
    'server': None,
    'error': None
}

def run_speedtest():
    """Run the speed test in a background thread"""
    global current_test
    
    try:
        current_test['status'] = 'running'
        current_test['error'] = None
        
        # Initialize speedtest with secure connection
        st = speedtest.Speedtest(secure=True)
        
        # Get best server
        current_test['status'] = 'finding_server'
        st.get_best_server()
        server = st.results.server
        current_test['server'] = {
            'name': server['name'],
            'country': server['country'],
            'sponsor': server['sponsor']
        }
        
        # Test ping
        current_test['status'] = 'testing_ping'
        current_test['ping'] = round(st.results.ping, 2)
        
        # Test download with real-time callback
        current_test['status'] = 'testing_download'
        import time
        download_start_time = time.time()
        download_bytes = [0]  # Use list to allow modification in callback
        
        def download_callback(chunk_size):
            download_bytes[0] += chunk_size
            elapsed = time.time() - download_start_time
            if elapsed > 0:
                # Calculate current speed in Mbps
                current_speed = (download_bytes[0] * 8) / (elapsed * 1_000_000)
                current_test['download'] = round(current_speed, 2)
        
        download_speed = st.download(callback=download_callback)
        current_test['download'] = round(download_speed / 1_000_000, 2)  # Final result
        
        # Test upload with real-time callback
        current_test['status'] = 'testing_upload'
        upload_start_time = time.time()
        upload_bytes = [0]
        
        def upload_callback(chunk_size):
            upload_bytes[0] += chunk_size
            elapsed = time.time() - upload_start_time
            if elapsed > 0:
                # Calculate current speed in Mbps
                current_speed = (upload_bytes[0] * 8) / (elapsed * 1_000_000)
                current_test['upload'] = round(current_speed, 2)
        
        upload_speed = st.upload(callback=upload_callback)
        current_test['upload'] = round(upload_speed / 1_000_000, 2)  # Final result
        
        current_test['status'] = 'completed'
        
    except Exception as e:
        current_test['status'] = 'error'
        current_test['error'] = str(e)

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/start-test', methods=['POST'])
def start_test():
    """Start a new speed test"""
    global current_test
    
    if current_test['status'] in ['running', 'starting', 'finding_server', 'testing_ping', 'testing_download', 'testing_upload']:
        return jsonify({'error': 'Test already in progress'}), 400
    
    # Reset results
    current_test = {
        'status': 'starting',
        'ping': None,
        'download': None,
        'upload': None,
        'server': None,
        'error': None
    }
    
    # Run test in background thread
    thread = threading.Thread(target=run_speedtest)
    thread.daemon = True
    thread.start()
    
    return jsonify({'message': 'Test started'})

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current test status and results"""
    return jsonify(current_test)

if __name__ == '__main__':
    print("\n[*] Speed Test Server Starting...")
    print("[*] Open your browser to: http://localhost:5000")
    print("[*] Press CTRL+C to stop\n")
    app.run(debug=True, host='0.0.0.0', port=5000)


