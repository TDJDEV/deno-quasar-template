<script setup lang="ts">
import { importComponent } from "@/tools.js";
const { data } = defineProps<{ data: { templateKey:string } }>()
const component = (function({templateKey=""}) { return templateKey && importComponent(templateKey) })(section)
</script>
<template><component :is="component" :key="section?.id" v-bind="section" /></template>
