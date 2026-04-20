// Initialize Lucide Icons
lucide.createIcons();

// --- MOCK DATA STREAMS ---
const queueData = [
    { id: 'gate3', name: 'Gate 3 (Congested)', time: 18, type: 'bad' },
    { id: 'gate5', name: 'Gate 5 (Fast Track)', time: 3, type: 'good' },
    { id: 'washroomA', name: 'Washroom A', time: 5, type: 'good' },
    { id: 'foodB', name: 'Burger Stall B', time: 12, type: 'bad' }
];

const renderQueues = () => {
    const list = document.getElementById('queue-list');
    list.innerHTML = '';
    queueData.forEach(q => {
        list.innerHTML += `
            <li class="queue-item">
                <div class="queue-name"><i data-lucide="${q.type === 'good' ? 'check-circle' : 'alert-circle'}"></i> ${q.name}</div>
                <div class="queue-time ${q.type}">${q.time} mins</div>
            </li>
        `;
    });
    lucide.createIcons();
};

renderQueues();

// Mock Real-time Queue Updates (Edge CV inference simulation)
setInterval(() => {
    queueData.forEach(q => {
        // Randomly fluctuate times slightly
        q.time += Math.floor(Math.random() * 3) - 1;
        if(q.time < 0) q.time = 0;
        
        // Update status colors
        if(q.time > 10) q.type = 'bad';
        else q.type = 'good';
    });
    renderQueues();
}, 3000);

// --- INTERACTIVE FEATURES ---

// 1. Predictive Crowd Flow -> Reroute Traffic Action
document.getElementById('btn-reroute').addEventListener('click', () => {
    const btn = document.getElementById('btn-reroute');
    btn.innerHTML = '<i data-lucide="check"></i> Traffic Rerouted';
    btn.classList.replace('primary', 'secondary');
    
    // Simulate heat map change after backend updates
    setTimeout(() => {
        const secB = document.querySelector('.zone[data-intensity="high"]');
        if(secB) {
            secB.dataset.intensity = 'medium';
            secB.style.background = 'rgba(245, 158, 11, 0.8)'; // Orange
            secB.style.animation = 'none';
        }
    }, 1000);
    lucide.createIcons();
});

// 2. Mobile App: Find Food (Smart Navigation & Queueing)
document.getElementById('btn-find-food').addEventListener('click', () => {
    const navSuggestion = document.getElementById('nav-suggestion');
    navSuggestion.innerHTML = `
        <i data-lucide="navigation"></i>
        <div class="nav-text">
            <strong>Optimal Route Found</strong><br>
            Burger Stall A - 2 min walk<br>
            <span style="color:var(--accent-green)">Low Wait Time (3 mins)</span>
        </div>
    `;
    lucide.createIcons();
    
    // Simulate IPS movement on map
    const dot = document.getElementById('ips-dot');
    dot.style.top = '50%';
    dot.style.left = '50%';
    
    // Show path
    document.getElementById('nav-path').classList.remove('hidden');
});

// 3. Mobile App: Group Coordination
document.getElementById('btn-share-loc').addEventListener('click', () => {
    const friendDot = document.getElementById('friend-dot');
    friendDot.classList.remove('hidden');
    
    // Animate IPS logic - Calculate midpoint
    const dot = document.getElementById('ips-dot');
    dot.style.top = '40%';
    dot.style.left = '65%';
    
    const navSuggestion = document.getElementById('nav-suggestion');
    navSuggestion.innerHTML = `
        <i data-lucide="users"></i>
        <div class="nav-text">
            <strong>Meetup Point Set</strong><br>
            Meeting Sarah at Concourse C.<br>
            Area is uncrowded.
        </div>
    `;
    lucide.createIcons();
    document.getElementById('nav-path').classList.add('hidden');
});

// 4. Emergency Management Override
document.getElementById('btn-evacuate').addEventListener('click', () => {
    // Admin Side
    document.querySelector('.emergency-card').style.background = 'rgba(239, 68, 68, 0.2)';
    document.querySelector('.emergency-card').style.border = '1px solid var(--accent-red)';
    
    // App Side - Push Notification Mock (WebSocket Simulation)
    const toast = document.getElementById('app-toast');
    const toastMsg = document.getElementById('toast-message');
    toast.classList.remove('hidden');
    toastMsg.innerText = "EMERGENCY: Proceed to Exit G5 immediately. Avoid Sector B.";
    
    // App Side Map
    const map = document.querySelector('.map-container');
    map.style.border = '2px solid var(--accent-red)';
    
    // Reset path to exit manually
    document.getElementById('nav-path').classList.remove('hidden');
    document.getElementById('nav-path').style.background = 'var(--accent-red)';
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 6000);
});

// 5. Background Push Notifications (Smart Notifications)
// Simulates an alert based on predictive AI
setTimeout(() => {
    const toast = document.getElementById('app-toast');
    const toastMsg = document.getElementById('toast-message');
    
    // Only show if not in emergency
    if(toast.classList.contains('hidden')){
        toast.style.background = 'rgba(59, 130, 246, 0.9)'; // Blue info toast
        toast.classList.remove('hidden');
        toastMsg.innerText = "Tip: Your restroom has a 12 min wait. Level 2 is empty!";
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 5000);
    }
}, 8000);
