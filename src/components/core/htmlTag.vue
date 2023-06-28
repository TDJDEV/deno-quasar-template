<script setup lang="ts">defineProps<{ templateKey: string }>()</script>
<template lang=pug>component(:is="templateKey")</template>
