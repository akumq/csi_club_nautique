class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.activiteManager = new ActiviteManager('http://localhost:3000');
        this.selectedDay = null;
        this.initializeCalendar();
        this.setupEventListeners();
    }

    initializeCalendar() {
        this.updateCalendarHeader();
        this.renderCalendarGrid();
        this.loadActivities();
    }

    updateCalendarHeader() {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        document.getElementById('currentMonth').textContent = months[this.currentDate.getMonth()];
        document.getElementById('currentYear').textContent = this.currentDate.getFullYear();
    }

    renderCalendarGrid() {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        // Ajuster pour commencer par lundi (1) au lieu de dimanche (0)
        let startDay = firstDay.getDay() - 1;
        if (startDay === -1) startDay = 6;

        // Jours du mois précédent
        const prevMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0);
        for (let i = startDay - 1; i >= 0; i--) {
            this.createDayElement(prevMonth.getDate() - i, 'other-month');
        }

        // Jours du mois actuel
        const today = new Date();
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const isToday = this.currentDate.getMonth() === today.getMonth() &&
                           this.currentDate.getFullYear() === today.getFullYear() &&
                           i === today.getDate();
            this.createDayElement(i, isToday ? 'today' : '');
        }

        // Jours du mois suivant
        const remainingDays = 42 - (startDay + lastDay.getDate()); // 42 = 6 semaines * 7 jours
        for (let i = 1; i <= remainingDays; i++) {
            this.createDayElement(i, 'other-month');
        }
    }

    createDayElement(dayNumber, className = '') {
        const day = document.createElement('div');
        day.className = `calendar-day ${className}`;
        day.innerHTML = `
            <div class="day-number">${dayNumber}</div>
            <div class="activities"></div>
        `;
        day.addEventListener('click', () => this.showDaySchedule(dayNumber));
        document.getElementById('calendarGrid').appendChild(day);
    }

    async loadActivities() {
        try {
            const activities = await this.activiteManager.loadAllActivites();
            this.renderActivities(activities);
        } catch (error) {
            console.error('Erreur lors du chargement des activités:', error);
        }
    }

    renderActivities(activities) {
        const days = document.querySelectorAll('.calendar-day');
        days.forEach(day => {
            const dayNumber = parseInt(day.querySelector('.day-number').textContent);
            const activitiesContainer = day.querySelector('.activities');
            activitiesContainer.innerHTML = '';

            const dayActivities = activities.filter(activity => {
                const activityDate = new Date(activity.date);
                return activityDate.getDate() === dayNumber &&
                       activityDate.getMonth() === this.currentDate.getMonth() &&
                       activityDate.getFullYear() === this.currentDate.getFullYear();
            });

            dayActivities.forEach(activity => {
                const activityElement = document.createElement('div');
                activityElement.className = `activity ${activity.typeActivite.toLowerCase()}`;
                activityElement.textContent = `${activity.typeActivite} - ${activity.details.heureDebut}`;
                activityElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showActivityDetails(activity);
                });
                activitiesContainer.appendChild(activityElement);
            });
        });
    }

    setupEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.initializeCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.initializeCalendar();
        });

        document.getElementById('closeSchedule').addEventListener('click', () => {
            this.hideDaySchedule();
        });

        document.getElementById('addActivity').addEventListener('click', () => {
            this.showActivityModal();
        });

        document.getElementById('overlay').addEventListener('click', () => {
            this.hideDaySchedule();
        });
    }

    showDaySchedule(dayNumber) {
        if (this.selectedDay === dayNumber) {
            this.hideDaySchedule();
            return;
        }

        this.selectedDay = dayNumber;
        const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), dayNumber);
        
        document.getElementById('scheduleDate').textContent = date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const scheduleContent = document.getElementById('scheduleContent');
        scheduleContent.innerHTML = '';

        // Créer la grille horaire
        const hours = Array.from({length: 12}, (_, i) => i + 8); // 8h à 19h
        hours.forEach(hour => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.innerHTML = `
                <div class="time-label">${hour}:00</div>
                <div class="time-activities"></div>
            `;
            scheduleContent.appendChild(timeSlot);
        });

        // Afficher les activités du jour
        const dayActivities = this.activiteManager.getActivitesByDate(date);
        dayActivities.forEach(activity => {
            this.renderActivityInSchedule(activity);
        });

        document.getElementById('overlay').style.display = 'block';
        document.getElementById('daySchedule').style.display = 'block';
    }

    hideDaySchedule() {
        this.selectedDay = null;
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('daySchedule').style.display = 'none';
    }

    renderActivityInSchedule(activity) {
        const activityElement = document.createElement('div');
        activityElement.className = `activity ${activity.typeActivite.toLowerCase()}`;
        activityElement.innerHTML = `
            <div class="activity-header">
                <strong>${activity.typeActivite}</strong>
                <span>${activity.details.heureDebut} - ${activity.details.heureFin}</span>
            </div>
            <div class="activity-details">
                ${this.getActivityDetails(activity)}
            </div>
            <div class="activity-actions">
                <button class="btn btn-sm btn-outline-primary edit-activity" data-id="${activity.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-activity" data-id="${activity.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Trouver le bon créneau horaire
        const hour = parseInt(activity.details.heureDebut.split(':')[0]);
        const timeSlot = document.querySelector(`.time-slot:nth-child(${hour - 7})`);
        if (timeSlot) {
            timeSlot.querySelector('.time-activities').appendChild(activityElement);
        }
    }

    getActivityDetails(activity) {
        if (activity.typeActivite === 'Cours') {
            return `
                <div>Niveau: ${activity.details.niveau}</div>
                <div>Moniteur: ${activity.details.moniteur_id}</div>
            `;
        } else {
            return `
                <div>Client: ${activity.clientId}</div>
                <div>Matériel: ${activity.materiels.map(m => m.type).join(', ')}</div>
            `;
        }
    }

    showActivityModal(activity = null) {
        const modal = new bootstrap.Modal(document.getElementById('activityModal'));
        const form = document.getElementById('activityForm');
        form.innerHTML = this.generateActivityForm(activity);

        // Gestionnaire de soumission du formulaire
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const activityData = {
                date: this.currentDate.toISOString().split('T')[0],
                typeRes: formData.get('type'),
                details: {
                    heureDebut: formData.get('heureDebut'),
                    heureFin: formData.get('heureFin'),
                    niveau: formData.get('niveau'),
                    moniteur_id: formData.get('moniteur_id'),
                    materiel_id: formData.get('materiel_id')
                },
                client_id: formData.get('client_id'),
                // ... autres champs nécessaires
            };

            try {
                if (activity) {
                    await this.activiteManager.updateActivite(activity.id, activityData);
                } else {
                    await this.activiteManager.createActivite(activityData);
                }
                modal.hide();
                this.loadActivities();
            } catch (error) {
                console.error('Erreur lors de la sauvegarde de l\'activité:', error);
            }
        };

        modal.show();
    }

    generateActivityForm(activity = null) {
        return `
            <div class="mb-3">
                <label class="form-label">Type d'activité</label>
                <select class="form-select" name="type" required>
                    <option value="Cours" ${activity?.typeActivite === 'Cours' ? 'selected' : ''}>Cours</option>
                    <option value="Location" ${activity?.typeActivite === 'Location' ? 'selected' : ''}>Location</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Heure de début</label>
                <input type="time" class="form-control" name="heureDebut" 
                       value="${activity?.details.heureDebut || ''}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Heure de fin</label>
                <input type="time" class="form-control" name="heureFin" 
                       value="${activity?.details.heureFin || ''}" required>
            </div>
            <!-- Autres champs du formulaire -->
            <button type="submit" class="btn btn-primary">
                ${activity ? 'Modifier' : 'Créer'} l'activité
            </button>
        `;
    }
}

// Initialiser le calendrier
document.addEventListener('DOMContentLoaded', () => {
    const calendar = new Calendar();
}); 