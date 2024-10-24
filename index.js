class MovieApp {
    constructor() {
        this.API_KEY = 'cfaba5b5c4e2e93838dba7589763c2cf';
        this.BASE_URL = 'https://api.themoviedb.org/3';
        this.IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

        this.cache = new Map();
        this.cacheExpiration = 5 * 60 * 1000; 

        this.moviesContainer = document.getElementById('movies');
        this.searchInput = document.querySelector('.search-input');
        this.searchButton = document.querySelector('.search-button');

        this.init();
    }

    init() {
        this.loadPopularMovies();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.searchButton.addEventListener('click', () => {
            const query = this.searchInput.value.trim();
            if (query) {
                this.searchMovies(query);
            }
        });

        this.searchInput.addEventListener('input', () => {
            const query = this.searchInput.value.trim();
            if (query) {
                this.searchMovies(query);
            } else {
                this.loadPopularMovies(); 
            }
        });

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = this.searchInput.value.trim();
                if (query) {
                    this.searchMovies(query);
                }
            }
        });
    }

    async fetchWithCache(url) {
        const cachedData = this.cache.get(url);
        if (cachedData && Date.now() - cachedData.timestamp < this.cacheExpiration) {
            return cachedData.data;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

        
            this.cache.set(url, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            throw error;
        }
    }

    async loadPopularMovies() {
        this.showLoading();
        try {
            const url = `${this.BASE_URL}/movie/popular?api_key=${this.API_KEY}`;
            const data = await this.fetchWithCache(url);
            this.displayMovies(data.results);
        } catch (error) {
            this.showError('Error loading popular movies. Please try again later.');
            console.error('Error loading popular movies:', error);
        }
    }

    async searchMovies(query) {
        this.showLoading();
        try {
            const url = `${this.BASE_URL}/search/movie?api_key=${this.API_KEY}&query=${encodeURIComponent(query)}`;
            const data = await this.fetchWithCache(url);
            this.displayMovies(data.results);
        } catch (error) {
            this.showError('Error searching movies. Please try again later.');
            console.error('Error searching movies:', error);
        }
    }

    displayMovies(movies) {
        this.moviesContainer.innerHTML = '';

        if (movies.length === 0) {
            this.showError('No movies found.');
            return;
        }

        movies.forEach(movie => {
            const movieElement = this.createMovieElement(movie);
            this.moviesContainer.appendChild(movieElement);
        });
    }

    createMovieElement(movie) {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie-card';

        const posterPath = movie.poster_path
            ? this.IMAGE_BASE_URL + movie.poster_path
            : '/api/placeholder/200/300';

        movieElement.innerHTML = `
            <img 
                class="movie-poster" 
                src="${posterPath}" 
                alt="${movie.title}"
                onerror="this.src='/api/placeholder/200/300'"
            >
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-rating">★ ${movie.vote_average.toFixed(1)}</div>
            </div>
        `;

        return movieElement;
    }

    showLoading() {
        this.moviesContainer.innerHTML = '<div class="loading">Loading movies...</div>';
    }

    showError(message) {
        this.moviesContainer.innerHTML = `<div class="error">${message}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MovieApp();
});
