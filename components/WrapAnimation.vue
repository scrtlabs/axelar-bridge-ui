<template>
  <lottie-wrapper
    style="z-index: 20"
    :speed="1"
    :width="100"
    :height="100"
    :loop="false"
    :path="require('../assets/animations/' + selectedToken.animation)"
  />
</template>
<script>
export default {
    name: 'show-wrap-animation',
    props: {
        selectedToken: {},
    }
}
</script>
<style scoped>

@keyframes input-coin-anim {
    0% {
        transform: translate(0px, 250px);
        opacity: 0;
    }

    5% {
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    90% {
        opacity: 1;
    }

    90.1% {
        opacity: 0;
    }

    100% {
        transform: translate(400px, 0px);
        opacity: 0;
    }
}

@keyframes output-coin-anim {
    0% {
        transform: translate(0px, 0px);
        opacity: 0;
    }

    5% {
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    80% {
        opacity: 1;
    }

    95% {
        opacity: 0;
    }

    100% {
        transform: translate(430px, 250px);
        opacity: 0;
    }
}

>>> .right-input input::selection {
    background-color: #ff8c00;
}

>>> .right-input input {
    text-align: right;
}

.address-input >>> input::selection {
    background-color: #ff8c00;
}

.address-input >>> input {
    padding: 10px !important;
    background-color: rgb(54, 53, 73) !important;
    border-radius: 10px !important;
}

/* Hide the arrows of number field */
.number-input >>> input::-webkit-outer-spin-button,
.number-input >>> input::-webkit-inner-spin-button {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
}

</style>
