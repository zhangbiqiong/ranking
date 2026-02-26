const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    const classes = ['classA', 'classB', 'classC', 'classD', 'classE', 'classF', 'classG'];

    // 认证状态
    const isAuthenticated = ref(false);
    const token = ref(localStorage.getItem('token'));
    const currentUsername = ref(localStorage.getItem('username') || '');
    const authTab = ref('login');
    const authForm = ref({ username: '', password: '' });
    const authLoading = ref(false);
    const authError = ref('');

    if (token.value) {
      isAuthenticated.value = true;
    }

    // 数据状态
    const years = ref([]);
    const selectedYear = ref(null);
    const currentData = ref(null);
    const currentClass = ref(null);
    const searchKeyword = ref('');
    const loading = ref(false);
    const error = ref('');

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

    async function handleAuth() {
      authLoading.value = true;
      authError.value = '';

      try {
        const endpoint = authTab.value === 'login' ? '/api/auth/login' : '/api/auth/register';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authForm.value)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '请求失败');
        }

        if (authTab.value === 'login') {
          token.value = data.token;
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', authForm.value.username);
          currentUsername.value = authForm.value.username;
          isAuthenticated.value = true;
          loadYears();
        } else {
          authTab.value = 'login';
          authForm.value = { username: '', password: '' };
          alert('注册成功，请登录');
        }
      } catch (err) {
        authError.value = err.message;
      } finally {
        authLoading.value = false;
      }
    }

    function logout() {
      token.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      currentUsername.value = '';
      isAuthenticated.value = false;
      years.value = [];
      selectedYear.value = null;
      currentData.value = null;
    }

    function getAuthHeaders() {
      return token.value ? { 'Authorization': `Bearer ${token.value}` } : {};
    }

    async function loadYears() {
      try {
        const response = await fetch('/api/years', {
          headers: getAuthHeaders()
        });
        if (response.status === 401) {
          logout();
          return;
        }
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
      loading.value = true;
      error.value = '';
      currentClass.value = null;

      try {
        const response = await fetch(`/api/statistics/${year}`, {
          headers: getAuthHeaders()
        });
        if (response.status === 401) {
          logout();
          return;
        }
        const data = await response.json();

        if (data.error) {
          error.value = data.error;
        } else {
          currentData.value = data;
        }
      } catch (e) {
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

    if (isAuthenticated.value) {
      loadYears();
    }

    return {
      classes,
      isAuthenticated,
      token,
      currentUsername,
      authTab,
      authForm,
      authLoading,
      authError,
      years,
      selectedYear,
      currentClass,
      searchKeyword,
      loading,
      error,
      classCount,
      totalCount,
      averageScore,
      maxScore,
      displayData,
      handleAuth,
      logout,
      selectYear,
      getScoreClass
    };
  }
}).mount('#app');
