document.addEventListener('DOMContentLoaded', () => {
    const follower = document.createElement('div');
    follower.id = 'cursor-follower';
    follower.className = 'cursor-follower';
    document.body.appendChild(follower);

    let mouseX = 0;
    let mouseY = 0;

    // Position state
    let xp = 0;
    let yp = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Center offset (half of width/height 40px)
    const offset = 20;

    function animate() {
        // Linear interpolation for smooth trailing
        // The user's snippet used divisor 6. 
        // We calculate the distance to target (mouseX - offset) and move a fraction of it.
        xp += ((mouseX - offset - xp) / 6);
        yp += ((mouseY - offset - yp) / 6);

        follower.style.transform = `translate3d(${xp}px, ${yp}px, 0)`;

        requestAnimationFrame(animate);
    }

    // Start animation
    animate();
});
