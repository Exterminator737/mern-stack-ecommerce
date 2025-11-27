export const getRecentlyViewed = (max = 20) => {
  try {
    const raw = localStorage.getItem("rv.v1");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, max) : [];
  } catch (_) {
    return [];
  }
};

export const getTopCategories = (max = 2) => {
  try {
    const raw = localStorage.getItem("bp.v1");
    const obj = raw ? JSON.parse(raw) : {};
    const entries = Object.entries(obj).sort(
      (a, b) => (b[1] || 0) - (a[1] || 0)
    );
    return entries.slice(0, max).map(([cat]) => cat);
  } catch (_) {
    return [];
  }
};
