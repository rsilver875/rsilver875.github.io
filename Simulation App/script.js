class DigitalTransformationSimulation {
    constructor() {
        this.currentPhase = 1;
        this.maxPhases = 5;
        this.scores = {
            adoption: 0,
            morale: 100,
            project: 0
        };
        this.totalScore = 0;
        this.completedPhases = new Set();
        this.badges = [];
        this.leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        
        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeEventListeners() {
        document.getElementById('start-simulation').addEventListener('click', () => {
            this.showScreen('game-screen');
        });

        document.querySelectorAll('.phase-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const phase = e.currentTarget.dataset.phase;
                this.startPhase(phase);
            });
        });

        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = parseInt(e.currentTarget.dataset.choice);
                this.makeChoice(choice);
            });
        });

        document.getElementById('continue-btn').addEventListener('click', () => {
            this.continueToNextPhase();
        });

        document.getElementById('save-score-btn').addEventListener('click', () => {
            this.saveScore();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartSimulation();
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    startPhase(phase) {
        if (this.completedPhases.has(phase)) {
            return;
        }

        const dilemmas = this.getDilemmasForPhase(phase);
        const randomDilemma = dilemmas[Math.floor(Math.random() * dilemmas.length)];
        
        this.showDilemma(randomDilemma, phase);
    }

    getDilemmasForPhase(phase) {
        const dilemmas = {
            assessment: [
                {
                    title: "Resistance Assessment",
                    description: "The IT department is showing strong resistance to the new ERP system. They claim it's too complex and will slow down operations. How do you respond?",
                    choices: [
                        {
                            text: "Organize a detailed training session with IT leadership",
                            impact: "Adoption +15, Morale +5, Project +10"
                        },
                        {
                            text: "Implement the system gradually with IT input",
                            impact: "Adoption +10, Morale +10, Project +5"
                        },
                        {
                            text: "Proceed with implementation as planned",
                            impact: "Adoption +5, Morale -10, Project +15"
                        }
                    ]
                }
            ],
            planning: [
                {
                    title: "Timeline Pressure",
                    description: "The board wants to accelerate the timeline by 2 months to meet quarterly targets. This would require cutting some training time. What's your decision?",
                    choices: [
                        {
                            text: "Negotiate for additional resources to maintain quality",
                            impact: "Adoption +20, Morale +10, Project +5"
                        },
                        {
                            text: "Accept the timeline but extend training post-launch",
                            impact: "Adoption +10, Morale +5, Project +20"
                        },
                        {
                            text: "Agree to the accelerated timeline",
                            impact: "Adoption +5, Morale -15, Project +25"
                        }
                    ]
                }
            ],
            communication: [
                {
                    title: "Communication Crisis",
                    description: "Rumors are spreading that the new system will lead to job cuts. Employee morale is plummeting. How do you address this?",
                    choices: [
                        {
                            text: "Hold an all-hands meeting to address concerns transparently",
                            impact: "Adoption +15, Morale +20, Project +10"
                        },
                        {
                            text: "Send detailed email communications about job security",
                            impact: "Adoption +10, Morale +10, Project +5"
                        },
                        {
                            text: "Focus on technical training and ignore the rumors",
                            impact: "Adoption +5, Morale -20, Project +15"
                        }
                    ]
                }
            ],
            engagement: [
                {
                    title: "Key Champion Leaves",
                    description: "Your main change champion from the operations team has resigned. This was a critical supporter who was driving adoption. How do you respond?",
                    choices: [
                        {
                            text: "Quickly identify and train a new champion",
                            impact: "Adoption +10, Morale +5, Project +10"
                        },
                        {
                            text: "Distribute champion responsibilities across multiple people",
                            impact: "Adoption +15, Morale +10, Project +5"
                        },
                        {
                            text: "Continue without a dedicated champion",
                            impact: "Adoption -5, Morale -10, Project +20"
                        }
                    ]
                }
            ],
            monitoring: [
                {
                    title: "Performance Metrics",
                    description: "Adoption rates are below target, but the system is working well for those using it. The board is questioning the investment. What's your strategy?",
                    choices: [
                        {
                            text: "Implement additional incentives and recognition programs",
                            impact: "Adoption +25, Morale +15, Project +10"
                        },
                        {
                            text: "Focus on demonstrating ROI to the board",
                            impact: "Adoption +10, Morale +5, Project +20"
                        },
                        {
                            text: "Make system usage mandatory with consequences",
                            impact: "Adoption +20, Morale -20, Project +15"
                        }
                    ]
                }
            ]
        };

        return dilemmas[phase] || [];
    }

    showDilemma(dilemma, phase) {
        document.getElementById('dilemma-title').textContent = dilemma.title;
        document.getElementById('dilemma-description').textContent = dilemma.description;
        
        dilemma.choices.forEach((choice, index) => {
            const choiceBtn = document.querySelector(`[data-choice="${index}"]`);
            choiceBtn.querySelector('.choice-text').textContent = choice.text;
            choiceBtn.querySelector('.choice-impact').textContent = choice.impact;
        });

        this.currentPhase = phase;
        this.showScreen('dilemma-screen');
    }

    makeChoice(choiceIndex) {
        const dilemma = this.getCurrentDilemma();
        const choice = dilemma.choices[choiceIndex];
        
        this.applyChoiceImpact(choice.impact);
        this.completedPhases.add(this.currentPhase);
        this.currentPhase++;
        
        this.showFeedback(choice);
    }

    getCurrentDilemma() {
        const dilemmas = this.getDilemmasForPhase(this.currentPhase);
        return dilemmas[0]; // Simplified for this example
    }

    applyChoiceImpact(impactString) {
        const impacts = impactString.split(', ');
        impacts.forEach(impact => {
            const [metric, value] = impact.split(' ');
            const change = parseInt(value);
            
            if (metric === 'Adoption') {
                this.scores.adoption = Math.max(0, Math.min(100, this.scores.adoption + change));
            } else if (metric === 'Morale') {
                this.scores.morale = Math.max(0, Math.min(100, this.scores.morale + change));
            } else if (metric === 'Project') {
                this.scores.project = Math.max(0, Math.min(100, this.scores.project + change));
            }
        });
        
        this.calculateTotalScore();
        this.updateDisplay();
    }

    calculateTotalScore() {
        this.totalScore = Math.round(
            (this.scores.adoption * 0.4) + 
            (this.scores.morale * 0.3) + 
            (this.scores.project * 0.3)
        );
    }

    showFeedback(choice) {
        const feedback = this.generateFeedback(choice);
        document.getElementById('feedback-message').textContent = feedback.message;
        
        const impactChanges = document.getElementById('impact-changes');
        impactChanges.innerHTML = '';
        
        feedback.changes.forEach(change => {
            const changeEl = document.createElement('div');
            changeEl.className = `impact-change ${change.positive ? '' : 'negative'}`;
            changeEl.textContent = change.text;
            impactChanges.appendChild(changeEl);
        });
        
        this.showScreen('feedback-screen');
    }

    generateFeedback(choice) {
        const feedbacks = [
            "Excellent decision! The board is impressed with your strategic thinking and leadership approach.",
            "Good choice. This shows thoughtful consideration of all stakeholders involved.",
            "Interesting approach. The board has some concerns but appreciates your initiative.",
            "The board is concerned about this direction. Consider the long-term implications.",
            "This decision has raised some eyebrows. The board expects better results going forward."
        ];
        
        const randomFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
        
        return {
            message: randomFeedback,
            changes: [
                { text: `Adoption: ${this.scores.adoption}%`, positive: this.scores.adoption > 50 },
                { text: `Morale: ${this.scores.morale}%`, positive: this.scores.morale > 50 },
                { text: `Progress: ${this.scores.project}%`, positive: this.scores.project > 50 }
            ]
        };
    }

    continueToNextPhase() {
        if (this.currentPhase > this.maxPhases) {
            this.showResults();
        } else {
            this.showScreen('phase-selection');
        }
    }

    showResults() {
        this.calculateBadges();
        this.showScreen('results-screen');
        
        document.getElementById('final-adoption').textContent = `${this.scores.adoption}%`;
        document.getElementById('final-morale').textContent = `${this.scores.morale}%`;
        document.getElementById('final-project').textContent = `${this.scores.project}%`;
        document.getElementById('final-total').textContent = this.totalScore;
        
        this.displayBadges();
        this.displayPerformanceReview();
        this.displayLeaderboard();
    }

    calculateBadges() {
        this.badges = [];
        
        if (this.scores.adoption >= 80) {
            this.badges.push("Change Champion");
        }
        if (this.scores.morale >= 80) {
            this.badges.push("Team Builder");
        }
        if (this.scores.project >= 80) {
            this.badges.push("Project Master");
        }
        if (this.totalScore >= 85) {
            this.badges.push("Transformation Leader");
        }
        if (this.completedPhases.size === this.maxPhases) {
            this.badges.push("Completionist");
        }
    }

    displayBadges() {
        const badgesContainer = document.getElementById('badges-container');
        badgesContainer.innerHTML = '';
        
        this.badges.forEach(badge => {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'badge';
            badgeEl.textContent = badge;
            badgesContainer.appendChild(badgeEl);
        });
    }

    displayPerformanceReview() {
        const review = this.generatePerformanceReview();
        document.getElementById('performance-review').innerHTML = `
            <h3>Performance Review</h3>
            <p>${review}</p>
        `;
    }

    generatePerformanceReview() {
        if (this.totalScore >= 90) {
            return "Outstanding performance! You've successfully navigated the digital transformation with exceptional leadership. Your strategic approach and stakeholder management skills are exemplary. The board is highly satisfied with the results.";
        } else if (this.totalScore >= 75) {
            return "Good performance overall. You've managed the transformation reasonably well, though there are areas for improvement. The board acknowledges your efforts and expects continued progress.";
        } else if (this.totalScore >= 60) {
            return "Satisfactory performance with room for improvement. While you've made progress, the board has concerns about the overall success of the transformation. Focus on stakeholder engagement and adoption strategies.";
        } else {
            return "Below expectations. The transformation has faced significant challenges. The board is concerned about the project's success and expects immediate improvements in your approach to change management.";
        }
    }

    displayLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';
        
        this.leaderboard.sort((a, b) => b.score - a.score);
        
        this.leaderboard.slice(0, 10).forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span>${index + 1}. ${entry.name}</span>
                <span>${entry.score}</span>
            `;
            leaderboardList.appendChild(item);
        });
    }

    saveScore() {
        const playerName = document.getElementById('player-name').value.trim();
        if (!playerName) {
            alert('Please enter your name');
            return;
        }
        
        this.leaderboard.push({
            name: playerName,
            score: this.totalScore,
            date: new Date().toLocaleDateString()
        });
        
        localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));
        this.displayLeaderboard();
        
        document.getElementById('player-name').value = '';
        alert('Score saved successfully!');
    }

    restartSimulation() {
        this.currentPhase = 1;
        this.scores = { adoption: 0, morale: 100, project: 0 };
        this.totalScore = 0;
        this.completedPhases.clear();
        this.badges = [];
        
        this.showScreen('intro-screen');
        this.updateDisplay();
    }

    updateDisplay() {
        // Update progress bars
        document.getElementById('adoption-progress').style.width = `${this.scores.adoption}%`;
        document.getElementById('adoption-text').textContent = `${this.scores.adoption}%`;
        
        document.getElementById('morale-progress').style.width = `${this.scores.morale}%`;
        document.getElementById('morale-text').textContent = `${this.scores.morale}%`;
        
        document.getElementById('project-progress').style.width = `${this.scores.project}%`;
        document.getElementById('project-text').textContent = `${this.scores.project}%`;
        
        // Update score and phase
        document.getElementById('total-score').textContent = this.totalScore;
        document.getElementById('current-phase').textContent = this.currentPhase;
        
        // Update phase cards
        document.querySelectorAll('.phase-card').forEach(card => {
            const phase = card.dataset.phase;
            if (this.completedPhases.has(phase)) {
                card.style.opacity = '0.6';
                card.style.cursor = 'not-allowed';
            } else {
                card.style.opacity = '1';
                card.style.cursor = 'pointer';
            }
        });
    }
}

// Initialize the simulation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DigitalTransformationSimulation();
});