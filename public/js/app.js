const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    const classes = ['classA', 'classB', 'classC', 'classD', 'classE', 'classF', 'classG'];
    
    const years = ref([]);
    const selectedYear = ref(null);
    const currentData = ref(null);
    const currentClass = ref(null);
    const searchKeyword = ref('');
    const loading = ref(false);
    const error = ref('');
    
    // 数据缓存
    const dataCache = ref({});
    
    // 加载进度
    const showProgress = ref(false);
    const progress = ref(0);

    const classCount = computed(() => {
      if (!currentData.value) return 0;
      const classSet = new Set(currentData.value.statistics.map(s => s.className));
      return classSet.size;
    });

    const totalCount = computed(() => {
      if (!currentData.value) return 0;
      return currentData.value.statistics.length;
    });

    const averageScore = computed(() => {
      if (!currentData.value || currentData.value.statistics.length === 0) return 0;
      const total = currentData.value.statistics.reduce((sum, s) => sum + s.score, 0);
      return Math.round(total / currentData.value.statistics.length);
    });

    const maxScore = computed(() => {
      if (!currentData.value || currentData.value.statistics.length === 0) return 0;
      return Math.max(...currentData.value.statistics.map(s => s.score));
    });

    const displayData = computed(() => {
      if (!currentData.value) return [];
      let data = currentData.value.statistics;
      
      if (currentClass.value !== null) {
        data = data.filter(s => s.className === currentClass.value);
      }
      
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        data = data.filter(s => s.studentName.toLowerCase().includes(keyword));
      }
      
      return data;
    });

    async function loadYears() {
      try {
        const response = await fetch('/api/years');
        const data = await response.json();
        years.value = data.sort((a, b) => b - a);
        if (years.value.length > 0) {
          selectYear(years.value[0]);
        }
      } catch (e) {
        console.error('加载年份失败:', e);
      }
    }

    async function selectYear(year) {
      selectedYear.value = year;
      
      // 检查缓存
      if (dataCache.value[year]) {
        currentData.value = dataCache.value[year];
        loading.value = false;
        error.value = '';
        return;
      }
      
      loading.value = true;
      error.value = '';
      currentClass.value = null;
      
      // 显示进度条
      showProgress.value = true;
      progress.value = 0;
      
      // 模拟进度
      const progressInterval = setInterval(() => {
        if (progress.value < 90) {
          progress.value += Math.random() * 10;
        }
      }, 100);

      try {
        const response = await fetch(`/api/statistics/${year}`);
        const data = await response.json();
        
        // 完成进度
        progress.value = 100;
        clearInterval(progressInterval);
        
        setTimeout(() => {
          showProgress.value = false;
          progress.value = 0;
        }, 300);
        
        if (data.error) {
          error.value = data.error;
        } else {
          currentData.value = data;
          // 缓存数据
          dataCache.value[year] = data;
        }
      } catch (e) {
        clearInterval(progressInterval);
        showProgress.value = false;
        progress.value = 0;
        error.value = '请求失败: ' + e.message;
      } finally {
        loading.value = false;
      }
    }

    function getScoreClass(score) {
      if (score >= 90) return 'score-high';
      if (score >= 60) return 'score-mid';
      return 'score-low';
    }

    loadYears();

    return {
      classes,
      years,
      selectedYear,
      currentClass,
      searchKeyword,
      loading,
      error,
      showProgress,
      progress,
      classCount,
      totalCount,
      averageScore,
      maxScore,
      displayData,
      selectYear,
      getScoreClass
    };
  }
}).mount('#app');
