class CountdownBanner {
    constructor() {
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.timerInterval = null;
    }

    init() {
        // Run once immediately to avoid 1-second delay
        this.updateCountdown();
        
        // Update every second
        // Arrow function () => preserves 'this' context
        this.timerInterval = setInterval(() => this.updateCountdown(), 1000);
        
        console.log(`Promo Code Active: ${this.getPromoCode()}`);
    }

    getWeekNum() {
        const today = new Date();
        const janFirst = new Date(today.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((today - janFirst) / (24 * 60 * 60 * 1000));
        return Math.ceil((today.getDay() + 1 + numberOfDays) / 7);
    }
	
	// If you want to add a promo code to the banner, use this function
    getPromoCode() {
        return this.getWeekNum() % 2 === 0 ? 'Text1' : 'orText2';
    }

    updateCountdown() {
        const now = new Date();

        // Calculate Next Sunday 23:59:59
        const end = new Date(now);
        const dayOfWeek = now.getDay(); // Sunday = 0
        
        // If today is Sunday, this targets tonight. 
        // If you want next week's Sunday, change the logic slightly.
        const daysToSunday = (7 - dayOfWeek) % 7; 
        
        end.setDate(now.getDate() + daysToSunday);
        end.setHours(23, 59, 59, 999);

        const diff = end - now;

        if (diff <= 0) {
            this.days = 0;
            this.hours = 0;
            this.minutes = 0;
            this.seconds = 0;
            this.render(); // Update UI one last time
            clearInterval(this.timerInterval); // Stop the timer
            return;
        }

        this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
        this.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((diff % (1000 * 60)) / 1000);

        this.render();
    }

    // Function to  show the results on the screen
	render() {
		// Style elements with these IDs in your HTML
		if(document.getElementById('days')) {
			document.getElementById('days').innerText = this.days;
			document.getElementById('hours').innerText = this.hours;
			document.getElementById('minutes').innerText = this.minutes;
			document.getElementById('seconds').innerText = this.seconds;
			document.getElementById('promo-text').innerText = this.getPromoCode();
		}
	}
}

// Usage
const banner = new CountdownBanner();
banner.init();
