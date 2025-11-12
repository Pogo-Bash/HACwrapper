<template>
  <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" :width="width" :height="height" :class="className">
    <!-- Main container - rotated 45 degrees counterclockwise -->
    <g transform="translate(200, 200) rotate(-45)">
      <!-- Bottom Layer (Lightest Blue) -->
      <g transform="translate(0, 40)">
        <rect x="-80" y="-80" width="160" height="160" rx="24" ry="24" fill="#7AD7FF" opacity="0.7" transform="rotate(45)">
          <animate
            v-if="animated"
            attributeName="y"
            values="-80; -60; -80"
            dur="4s"
            repeatCount="indefinite" />
        </rect>
      </g>

      <!-- Middle Layer (Medium Blue) -->
      <g transform="translate(0, 0)">
        <rect x="-80" y="-80" width="160" height="160" rx="24" ry="24" fill="#29AAFF" opacity="0.7" transform="rotate(45)">
          <animate
            v-if="animated"
            attributeName="y"
            values="-80; -70; -80"
            dur="4s"
            repeatCount="indefinite" />
        </rect>
      </g>

      <!-- Top Layer (Darkest Blue) -->
      <g transform="translate(0, -40)">
        <rect x="-80" y="-80" width="160" height="160" rx="24" ry="24" fill="#0078D4" opacity="0.7" transform="rotate(45)">
          <animate
            v-if="animated"
            attributeName="y"
            values="-80; -90; -80"
            dur="4s"
            repeatCount="indefinite" />
        </rect>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  width?: string | number
  height?: string | number
  animated?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100',
  height: '100',
  animated: true,
  className: ''
})

const viewBox = '0 0 400 400'
</script>
