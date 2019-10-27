<template>
  <div :style="{
    backgroundColor : value.fillColor,
    border:'solid',
    borderColor: value.borderColor,
    borderWidth: value.borderWidth + 'px',
    width: width || '100%',
    height: width || '100%',
    borderRadius: radius || '50%',
    margin:'auto',
    }"></div>
</template>

<script>

export default {
  props : ['value','width','radius']
}
</script>
