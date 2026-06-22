/* ==========================================
   SMARTCHEF AI - RECIPE GENERATOR
   Main JavaScript
   ========================================== */

// ==========================================
// DOMContentLoaded - Initialize Everything
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

  'use strict';

  // ---- CACHE DOM ELEMENTS ----
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  // Preloader
  const preloader = $('#preloader');

  // Header / Nav
  const header = $('#header');
  const navToggle = $('#navToggle');
  const navMenu = $('#navMenu');
  const navLinks = $$('.nav__link');
  const hamburgerIcon = $('#hamburgerIcon');

  // Theme
  const themeToggle = $('#themeToggle');
  const themeIcon = $('#themeIcon');

  // Hero Form
  const heroForm = $('#heroForm');
  const heroIngredients = $('#heroIngredients');
  const heroClearBtn = $('#heroClearBtn');
  const heroCuisine = $('#heroCuisine');
  const trendingTags = $$('.hero__trending-tag');

  // Generator Form
  const generatorForm = $('#generatorForm');
  const ingredientsInput = $('#ingredientsInput');
  const cuisineSelect = $('#cuisineSelect');
  const generateBtn = $('#generateBtn');

  // Recipe Output
  const loadingSpinner = $('#loadingSpinner');
  const emptyState = $('#emptyState');
  const recipeCard = $('#recipeCard');
  const savedRecipesSection = $('#savedRecipes');

  // Recipe Card Elements
  const recipeName = $('#recipeName');
  const recipeCuisineBadge = $('#recipeCuisineBadge');
  const recipeTime = $('#recipeTime');
  const recipeDifficulty = $('#recipeDifficulty');
  const recipeServings = $('#recipeServings');
  const recipeIngredients = $('#recipeIngredients');
  const recipeSteps = $('#recipeSteps');
  const saveRecipeBtn = $('#saveRecipeBtn');
  const shareRecipeBtn = $('#shareRecipeBtn');
  const saveRecipeBtn2 = $('#saveRecipeBtn2');
  const shareRecipeBtn2 = $('#shareRecipeBtn2');

  // History
  const historyList = $('#historyList');
  const clearHistoryBtn = $('#clearHistoryBtn');

  // Saved Recipes
  const savedRecipesList = $('#savedRecipesList');

  // Newsletter
  const newsletterForm = $('#newsletterForm');

  // Back to Top
  const backToTop = $('#backToTop');

  // Toast Container
  const toastContainer = $('#toastContainer');

  // Year
  const currentYear = $('#currentYear');

  // ==========================================
  // STATE
  // ==========================================
  const STATE = {
    currentRecipe: null,       // The last generated recipe object
    searchHistory: [],         // Array of {ingredients, cuisine, timestamp}
    savedRecipes: [],          // Array of recipe objects
    isDarkMode: false,
    isGenerating: false,
  };

  // Load saved data from localStorage
  function loadSavedData() {
    try {
      const saved = localStorage.getItem('smartchef_savedRecipes');
      if (saved) STATE.savedRecipes = JSON.parse(saved);

      const history = localStorage.getItem('smartchef_searchHistory');
      if (history) STATE.searchHistory = JSON.parse(history);

      const theme = localStorage.getItem('smartchef_theme');
      if (theme === 'dark') {
        STATE.isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
      }
    } catch (e) {
      console.warn('Failed to load saved data:', e);
    }
  }

  // Save data to localStorage
  function saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message, type = 'info', duration = 3500) {
    const iconMap = {
      success: 'fa-circle-check',
      error: 'fa-circle-xmark',
      info: 'fa-circle-info',
      warning: 'fa-triangle-exclamation',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <i class="fas ${iconMap[type] || iconMap.info} toast__icon"></i>
      <span class="toast__message">${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.classList.add('toast--removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ==========================================
  // PRELOADER
  // ==========================================
  function hidePreloader() {
    preloader.classList.add('hidden');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }

  // Hide preloader once page is fully loaded
  window.addEventListener('load', hidePreloader);

  // Fallback: hide preloader after 3s regardless
  setTimeout(hidePreloader, 3000);

  // ==========================================
  // THEME TOGGLE (Dark / Light Mode)
  // ==========================================
  function toggleTheme() {
    STATE.isDarkMode = !STATE.isDarkMode;

    if (STATE.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeIcon.className = 'fas fa-sun';
      saveToStorage('smartchef_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeIcon.className = 'fas fa-moon';
      saveToStorage('smartchef_theme', 'light');
    }

    showToast(
      STATE.isDarkMode ? '🌙 Dark mode activated' : '☀️ Light mode activated',
      'info',
      2000
    );
  }

  themeToggle.addEventListener('click', toggleTheme);

  // Keyboard shortcut: press 'T' to toggle theme
  document.addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === 'T') {
      if (!e.target.matches('input, textarea, select, button')) {
        toggleTheme();
      }
    }
  });

  // ==========================================
  // MOBILE NAVIGATION
  // ==========================================
  function toggleMobileNav() {
    const isOpen = navMenu.classList.toggle('show');
    hamburgerIcon.className = isOpen ? 'fas fa-xmark' : 'fas fa-bars';
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';

    // Create or remove overlay
    let overlay = document.querySelector('.nav-overlay');
    if (isOpen) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        overlay.addEventListener('click', toggleMobileNav);
        document.body.appendChild(overlay);
      }
      requestAnimationFrame(() => overlay.classList.add('show'));
    } else {
      if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
      }
    }
  }

  function closeMobileNav() {
    navMenu.classList.remove('show');
    hamburgerIcon.className = 'fas fa-bars';
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    const overlay = document.querySelector('.nav-overlay');
    if (overlay) {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
    }
  }

  navToggle.addEventListener('click', toggleMobileNav);

  // Close nav on link click
  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Close nav on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('show')) {
      closeMobileNav();
    }
  });

  // ==========================================
  // HEADER SCROLL EFFECT
  // ==========================================
  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Add background on scroll
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Back to top visibility
    if (scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // Active nav link based on scroll position
    updateActiveNavLink(scrollY);

    lastScrollY = scrollY;
  });

  // ==========================================
  // ACTIVE NAV LINK (Scroll Spy)
  // ==========================================
  function updateActiveNavLink(scrollY) {
    const sections = ['hero', 'features', 'generator', 'nutrition', 'testimonials', 'contact'];

    for (const section of sections) {
      const el = document.getElementById(section);
      if (!el) continue;

      const offsetTop = el.offsetTop - 120;
      const offsetBottom = offsetTop + el.offsetHeight;

      if (scrollY >= offsetTop && scrollY < offsetBottom) {
        navLinks.forEach(link => {
          link.classList.toggle('active-link', link.dataset.section === section);
        });
        break;
      }
    }
  }

  // ==========================================
  // BACK TO TOP
  // ==========================================
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ==========================================
  // BUTTON RIPPLE EFFECT
  // ==========================================
  function createRipple(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  // Add ripple to all buttons
  $$('.btn').forEach(btn => {
    btn.addEventListener('click', createRipple);
  });

  // ==========================================
  // MOCK AI RECIPE DATABASE
  // ==========================================
  const RECIPE_DATABASE = [
    // --- INDIAN ---
    {
      name: 'Spiced Vegetable Curry',
      cuisine: 'Indian',
      time: '30 mins',
      difficulty: 'Easy',
      servings: '3 servings',
      keywords: ['onion', 'tomato', 'potato', 'garlic', 'ginger', 'chilli', 'cumin', 'turmeric', 'peas', 'carrot', 'bean', 'lentil'],
      ingredients: ['2 medium onions, finely diced', '3 ripe tomatoes, pureed', '2 potatoes, cubed', '4 cloves garlic, minced', '1 inch ginger, grated', '1 tsp cumin seeds', '1 tsp turmeric powder', '1 tsp garam masala', '2 tbsp oil', 'Salt to taste', 'Fresh coriander for garnish'],
      steps: [
        'Heat oil in a pan over medium heat. Add cumin seeds and let them splutter.',
        'Add finely diced onions and sauté until golden brown (about 5-6 minutes).',
        'Add minced garlic and grated ginger. Cook for 1 minute until fragrant.',
        'Add tomato puree, turmeric powder, and salt. Cook until oil separates (8-10 minutes).',
        'Add cubed potatoes and 1 cup of water. Cover and cook for 12-15 minutes until potatoes are tender.',
        'Sprinkle garam masala, stir well, and cook for another 2 minutes.',
        'Garnish with fresh coriander leaves. Serve hot with rice or roti.'
      ]
    },
    {
      name: 'Classic Tomato Onion Rice',
      cuisine: 'Indian',
      time: '25 mins',
      difficulty: 'Easy',
      servings: '2 servings',
      keywords: ['onion', 'tomato', 'rice', 'garlic', 'chilli', 'cumin'],
      ingredients: ['1 cup basmati rice', '2 large onions, sliced', '2 tomatoes, chopped', '3 garlic cloves, minced', '2 green chillies, slit', '1 tsp cumin seeds', '1 tbsp ghee or oil', '1 tsp salt', 'Fresh coriander'],
      steps: [
        'Wash and soak rice for 15 minutes. Drain and set aside.',
        'Heat ghee in a pan. Add cumin seeds and let them crackle.',
        'Add sliced onions and sauté until caramelized (8 minutes).',
        'Add garlic, green chillies, and tomatoes. Cook until tomatoes soften.',
        'Add rice, 2 cups water, and salt. Bring to a boil.',
        'Cover and simmer on low heat for 12-15 minutes until rice is cooked.',
        'Fluff with a fork, garnish with coriander, and serve with yogurt.'
      ]
    },
    {
      name: 'Aloo Matar (Potato & Peas Curry)',
      cuisine: 'Indian',
      time: '35 mins',
      difficulty: 'Medium',
      servings: '4 servings',
      keywords: ['potato', 'peas', 'onion', 'tomato', 'garlic', 'ginger', 'cumin', 'turmeric'],
      ingredients: ['3 potatoes, cubed', '1 cup green peas', '1 large onion, finely chopped', '2 tomatoes, pureed', '1 tsp cumin seeds', '1/2 tsp turmeric', '1 tsp garam masala', '1 tsp coriander powder', '2 tbsp oil', 'Salt'],
      steps: [
        'Heat oil in a pan. Add cumin seeds and let them splutter.',
        'Add chopped onion and sauté until golden.',
        'Add tomato puree, turmeric, coriander powder, and salt. Cook for 5 minutes.',
        'Add cubed potatoes and 1.5 cups warm water. Cover and cook for 15 minutes.',
        'Add green peas and cook for another 5-7 minutes.',
        'Sprinkle garam masala, stir, and simmer for 2 minutes.',
        'Serve hot with roti or naan.'
      ]
    },
    // --- CHINESE ---
    {
      name: 'Veggie Stir-Fry Noodles',
      cuisine: 'Chinese',
      time: '20 mins',
      difficulty: 'Easy',
      servings: '2 servings',
      keywords: ['noodle', 'onion', 'garlic', 'soy sauce', 'carrot', 'cabbage', 'capsicum', 'ginger', 'chilli'],
      ingredients: ['200g noodles', '1 onion, sliced', '1 carrot, julienned', '1/2 cabbage, shredded', '1 capsicum, sliced', '3 garlic cloves, minced', '1 inch ginger, julienned', '2 tbsp soy sauce', '1 tbsp vinegar', '1 tsp chilli sauce', '2 tbsp oil', 'Spring onions for garnish'],
      steps: [
        'Cook noodles according to package directions. Drain, rinse with cold water, and toss with 1 tsp oil to prevent sticking.',
        'Heat oil in a wok over high heat. Add minced garlic and ginger — stir for 30 seconds.',
        'Add onion and stir-fry for 1 minute. Then add carrot, cabbage, and capsicum.',
        'Stir-fry vegetables on high heat for 3-4 minutes — they should remain crunchy.',
        'Add soy sauce, vinegar, and chilli sauce. Toss well.',
        'Add cooked noodles and toss everything together for 1-2 minutes.',
        'Garnish with spring onions and serve hot.'
      ]
    },
    {
      name: 'Fried Rice with Vegetables',
      cuisine: 'Chinese',
      time: '20 mins',
      difficulty: 'Easy',
      servings: '2 servings',
      keywords: ['rice', 'onion', 'garlic', 'soy sauce', 'carrot', 'peas', 'egg', 'corn'],
      ingredients: ['2 cups cooked rice (preferably day-old)', '1 onion, diced', '1 carrot, diced', '1/2 cup peas', '1/2 cup corn', '2 garlic cloves, minced', '2 eggs', '2 tbsp soy sauce', '1 tbsp sesame oil', '2 tbsp oil', 'Spring onions'],
      steps: [
        'Heat oil in a wok over high heat. Scramble the eggs and set aside.',
        'In the same wok, add more oil. Sauté garlic for 30 seconds.',
        'Add onion, carrot, peas, and corn. Stir-fry for 3-4 minutes.',
        'Add cold rice and break up any clumps. Stir-fry for 2 minutes.',
        'Add soy sauce and sesame oil. Toss well to combine.',
        'Add scrambled eggs back in and mix through.',
        'Garnish with spring onions and serve hot.'
      ]
    },
    // --- ITALIAN ---
    {
      name: 'Garden Pasta Pomodoro',
      cuisine: 'Italian',
      time: '25 mins',
      difficulty: 'Easy',
      servings: '3 servings',
      keywords: ['pasta', 'tomato', 'garlic', 'olive oil', 'basil', 'onion', 'chilli'],
      ingredients: ['300g pasta (spaghetti or penne)', '4 ripe tomatoes, chopped', '4 garlic cloves, sliced', '1 small onion, diced', '3 tbsp olive oil', 'Handful fresh basil leaves', '1 tsp red chilli flakes', 'Salt and pepper', 'Grated Parmesan (optional)'],
      steps: [
        'Cook pasta in salted boiling water until al dente. Reserve 1 cup pasta water, then drain.',
        'While pasta cooks, heat olive oil in a large pan over medium heat.',
        'Sauté sliced garlic and diced onion until soft and fragrant (3-4 minutes).',
        'Add chopped tomatoes, chilli flakes, salt, and pepper. Cook for 10 minutes until sauce thickens.',
        'Add the drained pasta to the sauce. Toss well, adding pasta water if needed for consistency.',
        'Tear fresh basil leaves over the top and toss once more.',
        'Serve with grated Parmesan if desired.'
      ]
    },
    {
      name: 'Italian Bruschetta Bowl',
      cuisine: 'Italian',
      time: '15 mins',
      difficulty: 'Easy',
      servings: '2 servings',
      keywords: ['bread', 'tomato', 'basil', 'olive oil', 'garlic', 'onion'],
      ingredients: ['4 slices crusty bread', '4 ripe tomatoes, diced', '1/4 red onion, finely diced', '3 garlic cloves', 'Fresh basil leaves', '3 tbsp olive oil', '1 tbsp balsamic vinegar', 'Salt and pepper'],
      steps: [
        'Toast the bread slices until golden and crispy. Rub each slice with a cut garlic clove.',
        'In a bowl, combine diced tomatoes, red onion, and shredded basil.',
        'Drizzle with olive oil and balsamic vinegar. Season with salt and pepper.',
        'Let the tomato mixture sit for 5 minutes to develop flavors.',
        'Spoon the tomato mixture generously over each toast.',
        'Drizzle a little more olive oil on top and serve immediately.'
      ]
    },
    // --- MEXICAN ---
    {
      name: 'Bean & Veggie Tacos',
      cuisine: 'Mexican',
      time: '20 mins',
      difficulty: 'Easy',
      servings: '4 tacos',
      keywords: ['bean', 'tortilla', 'onion', 'tomato', 'garlic', 'chilli', 'lime', 'avocado', 'corn'],
      ingredients: ['1 can black beans, drained', '4 small tortillas', '1 onion, diced', '2 tomatoes, diced', '2 garlic cloves, minced', '1 avocado, sliced', '1 lime', '1 tsp cumin', '1 tsp chilli powder', 'Salt', 'Fresh coriander'],
      steps: [
        'Heat a pan with a little oil. Sauté garlic and half the onion for 2 minutes.',
        'Add black beans, cumin, chilli powder, and salt. Mash lightly and cook for 5 minutes.',
        'Warm the tortillas in a dry pan or directly over a flame.',
        'Assemble: spread bean mixture on each tortilla.',
        'Top with diced tomatoes, remaining onion, avocado slices, and fresh coriander.',
        'Squeeze fresh lime juice over the tacos and serve.'
      ]
    },
    {
      name: 'Mexican Rice Bowl',
      cuisine: 'Mexican',
      time: '30 mins',
      difficulty: 'Medium',
      servings: '2 servings',
      keywords: ['rice', 'bean', 'tomato', 'onion', 'garlic', 'chilli', 'corn', 'avocado', 'lime'],
      ingredients: ['1 cup rice', '1 can black beans', '1 onion, diced', '2 tomatoes, diced', '2 garlic cloves', '1 cup corn', '1 avocado', '1 lime', '1 tsp cumin', '1 tsp chilli powder', 'Fresh coriander', 'Salt'],
      steps: [
        'Cook rice according to package directions with a pinch of salt.',
        'In a pan, sauté garlic and onion until soft. Add beans, cumin, chilli powder, and salt. Cook 5 minutes.',
        'In a separate small pan, char the corn kernels until slightly blackened.',
        'To serve, layer rice, then bean mixture, corn, and diced tomatoes.',
        'Top with sliced avocado and fresh coriander.',
        'Squeeze lime juice over the bowl and serve warm.'
      ]
    },
    // --- GENERAL / ANY CUISINE ---
    {
      name: 'Hearty Veggie Soup',
      cuisine: 'Any',
      time: '35 mins',
      difficulty: 'Easy',
      servings: '4 servings',
      keywords: ['onion', 'tomato', 'potato', 'carrot', 'garlic', 'celery', 'bean', 'lentil', 'cabbage'],
      ingredients: ['1 onion, diced', '2 tomatoes, chopped', '2 potatoes, cubed', '2 carrots, diced', '3 garlic cloves, minced', '1 cup mixed beans or lentils', '4 cups vegetable broth', '1 tsp thyme', '1 bay leaf', 'Salt and pepper', 'Olive oil'],
      steps: [
        'Heat olive oil in a large pot. Sauté onion and garlic for 3 minutes.',
        'Add carrots and potatoes. Cook for 3-4 minutes, stirring occasionally.',
        'Add tomatoes, beans/lentils, vegetable broth, thyme, and bay leaf.',
        'Bring to a boil, then reduce heat. Cover and simmer for 20-25 minutes.',
        'Remove bay leaf. Season with salt and pepper.',
        'Serve hot with crusty bread on the side.'
      ]
    },
    {
      name: 'Garlic Butter Toast with Eggs',
      cuisine: 'Any',
      time: '10 mins',
      difficulty: 'Easy',
      servings: '2 servings',
      keywords: ['bread', 'egg', 'butter', 'garlic', 'milk', 'cheese'],
      ingredients: ['4 slices bread', '4 eggs', '3 tbsp butter', '2 garlic cloves, minced', '2 tbsp milk', 'Salt and pepper', 'Fresh chives'],
      steps: [
        'In a bowl, whisk eggs with milk, salt, and pepper.',
        'Melt 1 tbsp butter in a non-stick pan. Add minced garlic and sauté for 30 seconds.',
        'Pour in the egg mixture. Cook on low heat, gently stirring, until soft scrambled.',
        'Toast the bread slices until golden.',
        'Spread remaining butter on toast and top with garlic scrambled eggs.',
        'Garnish with fresh chives and serve immediately.'
      ]
    },
    {
      name: 'Crispy Potato Wedges',
      cuisine: 'Any',
      time: '40 mins',
      difficulty: 'Easy',
      servings: '2 servings',
      keywords: ['potato', 'garlic', 'chilli', 'oil', 'paprika'],
      ingredients: ['4 large potatoes', '4 garlic cloves, minced', '2 tbsp olive oil', '1 tsp paprika', '1 tsp chilli flakes', 'Salt', 'Fresh herbs'],
      steps: [
        'Preheat oven to 220°C (425°F).',
        'Wash and cut potatoes into wedge shapes (no need to peel).',
        'In a bowl, toss potato wedges with olive oil, minced garlic, paprika, chilli flakes, and salt.',
        'Arrange in a single layer on a baking tray lined with parchment paper.',
        'Bake for 30-35 minutes, flipping halfway through, until golden and crispy.',
        'Sprinkle with fresh herbs and serve hot with ketchup or dip.'
      ]
    },
    {
      name: 'Simple Garden Salad',
      cuisine: 'Any',
      time: '10 mins',
      difficulty: 'Easy',
      servings: '2 servings',
      keywords: ['tomato', 'onion', 'lettuce', 'cucumber', 'olive oil', 'lemon', 'avocado'],
      ingredients: ['2 tomatoes, diced', '1 cucumber, diced', '1 red onion, thinly sliced', '2 cups lettuce, torn', '1 avocado, diced', '3 tbsp olive oil', '1 lemon, juiced', 'Salt and pepper'],
      steps: [
        'Wash and prepare all vegetables as indicated.',
        'In a large salad bowl, combine lettuce, tomatoes, cucumber, onion, and avocado.',
        'In a small bowl, whisk together olive oil, lemon juice, salt, and pepper.',
        'Pour the dressing over the salad and toss gently to combine.',
        'Serve immediately as a side or add protein for a main meal.'
      ]
    }
  ];

  // ==========================================
  // RECIPE MATCHING ENGINE (Mock AI)
  // ==========================================
  function findBestRecipe(inputIngredients, cuisine) {
    // Normalize input
    const inputList = inputIngredients
      .split(',')
      .map(item => item.trim().toLowerCase())
      .filter(item => item.length > 0);

    if (inputList.length === 0) return null;

    // Score each recipe
    const scoredRecipes = RECIPE_DATABASE.map(recipe => {
      // Check cuisine match
      const cuisineMatch = cuisine === 'any' ||
        recipe.cuisine.toLowerCase() === cuisine.toLowerCase();

      if (!cuisineMatch) return { recipe, score: -1 };

      // Count matching ingredient keywords
      let matchCount = 0;
      const matchedKeywords = [];

      for (const keyword of recipe.keywords) {
        const kw = keyword.toLowerCase();
        for (const input of inputList) {
          if (input.includes(kw) || kw.includes(input)) {
            matchCount++;
            matchedKeywords.push(kw);
            break;
          }
        }
      }

      // Calculate score: ratio of matched keywords + bonus for more matches
      const keywordRatio = recipe.keywords.length > 0
        ? matchCount / recipe.keywords.length
        : 0;

      // Bonus for matching more different ingredients
      const uniqueMatchBonus = matchedKeywords.length > 0
        ? Math.min(matchedKeywords.length / inputList.length, 1) * 0.3
        : 0;

      const score = keywordRatio + uniqueMatchBonus;

      return { recipe, score };
    });

    // Sort by score descending, filter those with at least some match
    const candidates = scoredRecipes
      .filter(r => r.score > 0.1)
      .sort((a, b) => b.score - a.score);

    // Return best match, or null if no matches
    if (candidates.length === 0) return null;

    // Add some randomization among top candidates for variety
    const topScore = candidates[0].score;
    const topCandidates = candidates.filter(r => r.score >= topScore * 0.7);
    const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];

    return chosen.recipe;
  }

  // ==========================================
  // GENERATE RECIPE
  // ==========================================
  function generateRecipe(inputIngredients, cuisine) {
    if (STATE.isGenerating) return;

    // Validate input
    const trimmedInput = inputIngredients.trim();
    if (!trimmedInput) {
      showToast('Please enter at least one ingredient!', 'warning');
      return;
    }

    STATE.isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    // Show loading
    loadingSpinner.style.display = 'flex';
    emptyState.style.display = 'none';
    recipeCard.style.display = 'none';

    // Simulate AI processing delay (2 seconds)
    setTimeout(() => {
      // Find recipe
      const recipe = findBestRecipe(trimmedInput, cuisine);

      if (recipe) {
        // Display the recipe
        displayRecipe(recipe);

        // Add to search history
        addToHistory(trimmedInput, cuisine);

        // Show success toast
        showToast(`🍽️ "${recipe.name}" generated successfully!`, 'success');
      } else {
        // No match found - show a fallback suggestion
        loadingSpinner.style.display = 'none';
        emptyState.style.display = 'flex';

        // Generate a fallback recipe name
        const fallbackName = generateFallbackRecipeName(trimmedInput, cuisine);

        showToast('No exact match found. Try different ingredients!', 'warning');

        // Show empty with suggestion
        emptyState.querySelector('.generator__empty-icon').textContent = '🤔';
        emptyState.querySelector('.generator__empty-title').textContent = 'No Recipe Found';
        emptyState.querySelector('.generator__empty-desc').textContent =
          `We couldn't find a recipe matching "${trimmedInput}" for ${cuisine} cuisine. Try adding more ingredients or changing the cuisine type!`;
      }

      // Reset loading state
      loadingSpinner.style.display = 'none';
      STATE.isGenerating = false;
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> <span>Generate Recipe</span>';
    }, 2000);
  }

  // ==========================================
  // FALLBACK RECIPE NAME GENERATOR
  // ==========================================
  function generateFallbackRecipeName(ingredients, cuisine) {
    const list = ingredients.split(',').map(s => s.trim()).filter(Boolean);
    const firstIngredient = list[0] || 'Mystery';
    const capitalFirst = firstIngredient.charAt(0).toUpperCase() + firstIngredient.slice(1);

    const templates = [
      `${capitalFirst} Surprise`,
      `Quick ${capitalFirst} Delight`,
      `Chef's ${capitalFirst} Special`,
      `${capitalFirst} Fusion Bowl`,
      `Magic ${capitalFirst} Recipe`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  // ==========================================
  // DISPLAY RECIPE
  // ==========================================
  function displayRecipe(recipe) {
    // Store current recipe
    STATE.currentRecipe = recipe;

    // Show recipe card
    recipeCard.style.display = 'block';
    emptyState.style.display = 'none';

    // Set recipe name
    recipeName.textContent = recipe.name;

    // Set cuisine badge
    recipeCuisineBadge.textContent = recipe.cuisine;

    // Set time
    recipeTime.textContent = recipe.time;

    // Set difficulty with proper styling
    recipeDifficulty.textContent = recipe.difficulty;
    recipeDifficulty.className = `difficulty-badge ${recipe.difficulty.toLowerCase()}`;

    // Set servings
    recipeServings.textContent = recipe.servings;

    // Set ingredients
    recipeIngredients.innerHTML = recipe.ingredients
      .map(ing => `<li>${ing}</li>`)
      .join('');

    // Set steps
    recipeSteps.innerHTML = recipe.steps
      .map(step => `<li>${step}</li>`)
      .join('');

    // Reset save button state
    const isSaved = STATE.savedRecipes.some(r => r.name === recipe.name);
    updateSaveButtonState(isSaved);

    // Scroll to recipe card on mobile
    if (window.innerWidth <= 768) {
      recipeCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ==========================================
  // UPDATE SAVE BUTTON STATE
  // ==========================================
  function updateSaveButtonState(isSaved) {
    [saveRecipeBtn, saveRecipeBtn2].forEach(btn => {
      btn.classList.toggle('saved', isSaved);
      btn.innerHTML = isSaved
        ? '<i class="fas fa-bookmark"></i> Saved'
        : '<i class="fas fa-bookmark"></i> Save Recipe';
    });
  }

  // ==========================================
  // SAVE RECIPE
  // ==========================================
  function saveCurrentRecipe() {
    if (!STATE.currentRecipe) {
      showToast('No recipe to save. Generate one first!', 'warning');
      return;
    }

    const recipe = STATE.currentRecipe;
    const exists = STATE.savedRecipes.some(r => r.name === recipe.name);

    if (exists) {
      // Remove from saved
      STATE.savedRecipes = STATE.savedRecipes.filter(r => r.name !== recipe.name);
      saveToStorage('smartchef_savedRecipes', STATE.savedRecipes);
      updateSaveButtonState(false);
      showToast(`Removed "${recipe.name}" from saved recipes`, 'info');
    } else {
      // Add to saved
      STATE.savedRecipes.push({ ...recipe, savedAt: Date.now() });
      saveToStorage('smartchef_savedRecipes', STATE.savedRecipes);
      updateSaveButtonState(true);
      showToast(`💾 "${recipe.name}" saved successfully!`, 'success');
    }

    renderSavedRecipes();
  }

  // ==========================================
  // SHARE RECIPE
  // ==========================================
  function shareCurrentRecipe() {
    if (!STATE.currentRecipe) {
      showToast('No recipe to share. Generate one first!', 'warning');
      return;
    }

    const recipe = STATE.currentRecipe;
    const text = `🍽️ ${recipe.name}\n\n⏱️ ${recipe.time} | Difficulty: ${recipe.difficulty}\n\n🧂 Ingredients:\n${recipe.ingredients.map(i => `• ${i}`).join('\n')}\n\n👨‍🍳 Steps:\n${recipe.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}\n\nMade with SmartChef AI! 🚀`;

    // Try native share API first
    if (navigator.share) {
      navigator.share({
        title: recipe.name,
        text: text,
      }).catch(() => {
        // Fallback to clipboard
        copyToClipboard(text);
      });
    } else {
      copyToClipboard(text);
    }
  }

  // ==========================================
  // COPY TO CLIPBOARD
  // ==========================================
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Recipe copied to clipboard!', 'success');
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('📋 Recipe copied to clipboard!', 'success');
    });
  }

  // ==========================================
  // SEARCH HISTORY
  // ==========================================
  function addToHistory(ingredients, cuisine) {
    // Add to state
    STATE.searchHistory.unshift({
      ingredients,
      cuisine,
      timestamp: Date.now()
    });

    // Keep only last 10 entries
    if (STATE.searchHistory.length > 10) {
      STATE.searchHistory = STATE.searchHistory.slice(0, 10);
    }

    saveToStorage('smartchef_searchHistory', STATE.searchHistory);
    renderHistory();
  }

  function renderHistory() {
    if (STATE.searchHistory.length === 0) {
      historyList.innerHTML = '<p class="generator__history-empty">No searches yet. Try generating a recipe!</p>';
      return;
    }

    historyList.innerHTML = STATE.searchHistory
      .map((item, index) => `
        <div class="history-item" data-index="${index}">
          <span class="history-item__text">
            <i class="fas fa-clock-rotate"></i>
            ${item.ingredients.substring(0, 30)}${item.ingredients.length > 30 ? '...' : ''}
            <span style="font-size:0.75rem;color:var(--color-text-muted);font-weight:400;">
              (${item.cuisine})
            </span>
          </span>
          <button class="history-item__delete" data-index="${index}" aria-label="Remove from history" title="Remove">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `)
      .join('');

    // Add click handlers to history items
    historyList.querySelectorAll('.history-item').forEach(el => {
      const index = parseInt(el.dataset.index);
      const item = STATE.searchHistory[index];
      if (!item) return;

      // Click to re-search
      el.addEventListener('click', (e) => {
        if (e.target.closest('.history-item__delete')) return;
        heroIngredients.value = item.ingredients;
        heroCuisine.value = item.cuisine;
        ingredientsInput.value = item.ingredients;
        cuisineSelect.value = item.cuisine;
        window.scrollTo({ top: document.getElementById('generator').offsetTop - 100, behavior: 'smooth' });
        showToast(`Loaded "${item.ingredients}"`, 'info', 2000);
      });

      // Delete button
      const deleteBtn = el.querySelector('.history-item__delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          STATE.searchHistory.splice(index, 1);
          saveToStorage('smartchef_searchHistory', STATE.searchHistory);
          renderHistory();
          showToast('Removed from history', 'info', 1500);
        });
      }
    });
  }

  function clearHistory() {
    if (STATE.searchHistory.length === 0) {
      showToast('History is already empty', 'info', 1500);
      return;
    }
    STATE.searchHistory = [];
    saveToStorage('smartchef_searchHistory', STATE.searchHistory);
    renderHistory();
    showToast('🗑️ Search history cleared', 'info', 1500);
  }

  // ==========================================
  // SAVED RECIPES RENDER
  // ==========================================
  function renderSavedRecipes() {
    if (STATE.savedRecipes.length === 0) {
      savedRecipesSection.style.display = 'none';
      return;
    }

    savedRecipesSection.style.display = 'block';
    savedRecipesList.innerHTML = STATE.savedRecipes
      .map((recipe, index) => `
        <div class="saved-recipe-item" data-index="${index}">
          <div class="saved-recipe-item__info">
            <span class="saved-recipe-item__name">${recipe.name}</span>
            <span class="saved-recipe-item__meta">
              <span>${recipe.cuisine}</span>
              <span>•</span>
              <span>${recipe.time}</span>
              <span>•</span>
              <span>${recipe.difficulty}</span>
            </span>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="saved-recipe-item__remove" data-index="${index}" aria-label="Remove saved recipe" title="Remove">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        </div>
      `)
      .join('');

    // Click to view recipe
    savedRecipesList.querySelectorAll('.saved-recipe-item').forEach(el => {
      const index = parseInt(el.dataset.index);
      const recipe = STATE.savedRecipes[index];
      if (!recipe) return;

      el.addEventListener('click', (e) => {
        if (e.target.closest('.saved-recipe-item__remove')) return;
        displayRecipe(recipe);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast(`📖 Loading "${recipe.name}"`, 'info', 1500);
      });

      const removeBtn = el.querySelector('.saved-recipe-item__remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          STATE.savedRecipes.splice(index, 1);
          saveToStorage('smartchef_savedRecipes', STATE.savedRecipes);
          renderSavedRecipes();
          showToast('Removed from saved recipes', 'info', 1500);

          // If currently viewing this recipe, update save button
          if (STATE.currentRecipe && STATE.currentRecipe.name === recipe.name) {
            updateSaveButtonState(false);
          }
        });
      }
    });
  }

  // ==========================================
  // EVENT LISTENERS - Hero Form
  // ==========================================
  heroForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ingredients = heroIngredients.value.trim();
    if (!ingredients) {
      showToast('Please enter some ingredients first!', 'warning');
      return;
    }
    // Sync to generator form
    ingredientsInput.value = ingredients;
    cuisineSelect.value = heroCuisine.value;
    // Generate
    generateRecipe(ingredients, heroCuisine.value);
  });

  // Hero clear button
  heroIngredients.addEventListener('input', () => {
    heroClearBtn.classList.toggle('visible', heroIngredients.value.length > 0);
  });

  heroClearBtn.addEventListener('click', () => {
    heroIngredients.value = '';
    heroClearBtn.classList.remove('visible');
    heroIngredients.focus();
  });

  // Trending tags
  trendingTags.forEach(tag => {
    tag.addEventListener('click', () => {
      heroIngredients.value = tag.dataset.ingredients;
      heroClearBtn.classList.add('visible');
      ingredientsInput.value = tag.dataset.ingredients;
      // Auto-trigger generation
      generateRecipe(tag.dataset.ingredients, heroCuisine.value);
    });
  });

  // ==========================================
  // EVENT LISTENERS - Generator Form
  // ==========================================
  generatorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ingredients = ingredientsInput.value.trim();
    if (!ingredients) {
      showToast('Please enter some ingredients!', 'warning');
      return;
    }
    // Sync to hero form
    heroIngredients.value = ingredients;
    heroCuisine.value = cuisineSelect.value;
    generateRecipe(ingredients, cuisineSelect.value);
  });

  // ==========================================
  // EVENT LISTENERS - Recipe Actions
  // ==========================================
  saveRecipeBtn.addEventListener('click', saveCurrentRecipe);
  saveRecipeBtn2.addEventListener('click', saveCurrentRecipe);
  shareRecipeBtn.addEventListener('click', shareCurrentRecipe);
  shareRecipeBtn2.addEventListener('click', shareCurrentRecipe);

  // ==========================================
  // EVENT LISTENERS - History
  // ==========================================
  clearHistoryBtn.addEventListener('click', clearHistory);

  // ==========================================
  // EVENT LISTENERS - Newsletter
  // ==========================================
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#newsletterEmail').value.trim();

    if (!email) {
      showToast('Please enter your email address', 'warning');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // Simulate subscription
    showToast(`✅ Subscribed! Welcome to SmartChef AI!`, 'success');
    $('#newsletterEmail').value = '';
  });

  // ==========================================
  // INTERSECTION OBSERVER - Fade In Animations
  // ==========================================
  const fadeElements = $$('.fade-in');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  // ==========================================
  // NUTRITION COUNTER ANIMATION
  // ==========================================
  function animateCounters() {
    const counters = $$('.nutrition__value[data-target]');

    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target);
      if (isNaN(target)) return;

      // Check if already animated
      if (counter.dataset.animated === 'true') return;

      const duration = 1500;
      const step = Math.max(1, Math.floor(target / 30));
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
          counter.dataset.animated = 'true';
        }
        counter.textContent = current;
      }, duration / (target / step));
    });
  }

  // Observe nutrition section for counter animation
  const nutritionSection = $('#nutrition');
  if (nutritionSection) {
    const nutritionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          nutritionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    nutritionObserver.observe(nutritionSection);
  }

  // ==========================================
  // SET CURRENT YEAR IN FOOTER
  // ==========================================
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // ==========================================
  // KEYBOARD SHORTCUTS
  // ==========================================
  document.addEventListener('keydown', (e) => {
    // Ctrl+Enter to generate recipe
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const active = document.activeElement;
      if (active === ingredientsInput || active === heroIngredients) {
        e.preventDefault();
        if (active === ingredientsInput) {
          generatorForm.dispatchEvent(new Event('submit'));
        } else {
          heroForm.dispatchEvent(new Event('submit'));
        }
      }
    }

    // Escape to close mobile nav
    if (e.key === 'Escape' && navMenu.classList.contains('show')) {
      closeMobileNav();
    }
  });

  // ==========================================
  // INITIALIZATION
  // ==========================================
  loadSavedData();
  renderHistory();
  renderSavedRecipes();

  // Set initial year
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // Check for saved recipes visibility on load
  if (STATE.savedRecipes.length === 0) {
    savedRecipesSection.style.display = 'none';
  }

  console.log('%c🍳 SmartChef AI', 'font-size:24px; font-weight:bold; color:#6C63FF;');
  console.log('%cTurn your ingredients into delicious recipes!', 'font-size:14px; color:#8888AA;');
  console.log('%c💡 Tip: Press "T" to toggle dark/light mode | Ctrl+Enter to generate', 'font-size:12px; color:#AAAACC;');

}); // End DOMContentLoaded
