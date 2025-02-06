<script setup>
import { ref, onMounted } from "vue";
import api from "./api";

const ejercicios = ref([]);

onMounted(async () => {
  try {
    const response = await api.get("/ejercicios");
    ejercicios.value = response.data;
  } catch (error) {
    console.error("Error al obtener los ejercicios:", error);
  }
});
</script>

<template>
  <div>
    <h1>Lista de Ejercicios</h1>
    <ul>
      <li v-for="ejercicio in ejercicios" :key="ejercicio.id">
        {{ ejercicio.nombre }} - {{ ejercicio.descripcion }}
      </li>
    </ul>
  </div>
</template>
