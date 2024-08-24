<template>
  <div class="example">
    <div class="d-flex justify-content-around">
      <div class="d-flex flex-column">
        <p>This is a test page for Google Pay.</p>
        <div class="d-flex flex-wrap justify-content-between">
          <div
            class="d-flex flex-column align-content-around text-center font-weight-bold"
          >
            £1
            <GooglePay total-price="1.00" />
          </div>
          <div
            class="d-flex flex-column align-content-around text-center font-weight-bold"
          >
            £5
            <GooglePay total-price="5.00" />
          </div>
          <div
            class="d-flex flex-column align-content-around text-center font-weight-bold"
          >
            £10
            <GooglePay total-price="10.00" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
