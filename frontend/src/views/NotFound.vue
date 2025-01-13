<template>
  <div class="main-content">
    <h1>404 - Page non trouvée</h1>
    <p>La page que vous recherchez n'existe pas.</p>
    <router-link to="/" class="btn btn-primary">
      Retour à l'accueil
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script> 