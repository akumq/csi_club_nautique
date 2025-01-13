const availableMaterials = computed(() => {
  return materials.value.filter(material => material.statut === 'Disponible');
}); 

const handleSubmit = async () => {
  if (!validateTimes()) {
    return; // Empêcher la soumission si les heures ne sont pas valides
  }

  loading.value = true;
  try {
    const activityData = {
      date: selectedDate.value,
      typeActivite: form.value.typeActivite,
      details: {
        heureDebut: form.value.heureDebut,
        heureFin: form.value.heureFin,
        client_id: form.value.client_id,
      },
      materiels: form.value.materiels
    };

    await addActivity(activityData); // Ajoutez l'activité

    // Mettre à jour le statut des matériels
    for (const materielId of form.value.materiels) {
      await store.dispatch('materials/updateMaterialStatus', { id: materielId, status: 'En cours d\'utilisation' });
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  } finally {
    loading.value = false;
  }
} 

const handleDeleteActivity = async () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
    loading.value = true;
    try {
      await store.dispatch('activities/deleteActivity', props.activity.id); // Assurez-vous que props.activity.id est défini
      emit('close'); // Fermer le modal après la suppression
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'activité:', error);
    } finally {
      loading.value = false;
    }
  }
}; 