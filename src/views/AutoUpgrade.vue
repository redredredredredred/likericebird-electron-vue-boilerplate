<template>
  <div>
    <div>
      <p>
        <span>版本更新：</span>
        {{UpdaterText}}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'autoUpgrade',
  data() {
    return {
      UpdaterText: '',
    };
  },
  props: {},
  computed: {},
  methods: {},
};
</script>
