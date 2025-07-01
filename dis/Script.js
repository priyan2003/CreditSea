
        // Simulated Loan Processing System
        document.addEventListener('DOMContentLoaded', function() {
            // State management
            const state = {
                processing: true,
                connection: true,
                incomingRate: 0,
                processedRate: 0,
                errorRate: 0,
                avgLatency: 0,
                batchSize: 100,
                retryStrategy: 'immediate',
                errors: [],
                filteredErrors: [],
                currentPage: 1,
                itemsPerPage: 10,
                searchTerm: '',
                errorTypeFilter: '',
                timeframeFilter: '5m',
                rateHistory: [],
                errorHistory: [],
                chartsInitialized: false
            };

            const elements = {
                connectionStatus: document.getElementById('connection-status'),
                pauseBtn: document.getElementById('pause-btn'),
                incomingRate: document.getElementById('incoming-rate'),
                processedRate: document.getElementById('processed-rate'),
                errorRate: document.getElementById('error-rate'),
                avgLatency: document.getElementById('avg-latency'),
                errorLogsBody: document.getElementById('error-logs-body'),
                currentCount: document.getElementById('current-count'),
                totalCount: document.getElementById('total-count'),
                prevPage: document.getElementById('prev-page'),
                nextPage: document.getElementById('next-page'),
                searchInput: document.getElementById('search-input'),
                errorTypeFilter: document.getElementById('error-type-filter'),
                timeframeFilter: document.getElementById('timeframe-filter'),
                retryFailed: document.getElementById('retry-failed'),
                batchSize: document.getElementById('batch-size'),
                rateChartCtx: document.getElementById('rateChart').getContext('2d'),
                errorChartCtx: document.getElementById('errorChart').getContext('2d'),
                rateChart: null,
                errorChart: null
            };
            elements.pauseBtn.addEventListener('click', toggleProcessing);
            elements.searchInput.addEventListener('input', handleSearch);
            elements.errorTypeFilter.addEventListener('change', handleFilterChange);
            elements.timeframeFilter.addEventListener('change', handleFilterChange);
            elements.prevPage.addEventListener('click', goToPrevPage);
            elements.nextPage.addEventListener('click', goToNextPage);
            elements.retryFailed.addEventListener('click', retryFailedRecords);
            elements.batchSize.addEventListener('change', updateBatchSize);
            document.querySelectorAll('input[name="retry-strategy"]').forEach(radio => {
                radio.addEventListener('change', updateRetryStrategy);
            });

            function initializeCharts() {
                if (state.chartsInitialized) return;

                elements.rateChart = new Chart(elements.rateChartCtx, {
                    type: 'line',
                    data: {
                        labels: Array.from({ length: 30 }, (_, i) => (i * 2) + 's'),
                        datasets: [
                            {
                                label: 'Incoming Loans',
                                data: Array(30).fill(0),
                                borderColor: 'rgba(79, 70, 229, 1)',
                                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                borderWidth: 2,
                                tension: 0.4
                            },
                            {
                                label: 'Processed Loans',
                                data: Array(30).fill(0),
                                borderColor: 'rgba(16, 185, 129, 1)',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                borderWidth: 2,
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Loans per second'
                                }
                            }
                        }
                    }
                });

                elements.errorChart = new Chart(elements.errorChartCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Validation', 'API Failures', 'Timeouts', 'Database Errors'],
                        datasets: [{
                            data: [0, 0, 0, 0],
                            backgroundColor: [
                                'rgba(239, 68, 68, 0.8)',
                                'rgba(249, 115, 22, 0.8)',
                                'rgba(234, 179, 8, 0.8)',
                                'rgba(20, 184, 166, 0.8)'
                            ],
                            borderColor: [
                                'rgba(239, 68, 68, 1)',
                                'rgba(249, 115, 22, 1)',
                                'rgba(234, 179, 8, 1)',
                                'rgba(20, 184, 166, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: 'right' }
                        }
                    }
                });

                state.chartsInitialized = true;
            }
            function simulateProcessing() {
                if (state.processing) {
                    
                    state.incomingRate = Math.floor(Math.random() * 100) + 450;
                    
                    state.processedRate = Math.max(Math.floor(state.incomingRate * 0.98 - Math.random() * 10), 0);
                    
                    
                    state.errorRate = Math.random() < 0.1 ? Math.random() * 2 : state.errorRate;
                    
                    
                    state.avgLatency = Math.floor(Math.random() * 100) + 80;
                }

                updateMetrics();
                updateRateChart();
                updateErrorChart();
                
                if (Math.random() < 0.3) {
                    generateErrors();
                }
                
                setTimeout(simulateProcessing, 1000);
            }

            function generateErrors() {
                const errorTypes = ['validation', 'api', 'timeout', 'database'];
                const names = ['John Smith', 'Emma Johnson', 'Michael Williams', 'Sophia Brown', 'James Jones'];
                const reasons = [
                    'Invalid credit score format',
                    'Missing income verification',
                    'Address validation failed',
                    'API timeout on credit check',
                    'Database connection error',
                    'Invalid SSN format',
                    'Employment verification failed',
                    'Debt-to-income ratio too high'
                ];
                
                const numNewErrors = Math.floor(Math.random() * 3);
                
                for (let i = 0; i < numNewErrors; i++) {
                    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
                    
                    state.errors.unshift({
                        timestamp: new Date().toISOString(),
                        id: `ERR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        applicant: names[Math.floor(Math.random() * names.length)],
                        type: errorType,
                        details: reasons[Math.floor(Math.random() * reasons.length)],
                        status: 'open'
                    });
                }
                
                if (state.errors.length > 200) {
                    state.errors = state.errors.slice(0, 200);
                }
                
                filterErrors();
                renderErrorLogs();
                updateErrorChart();
            }

            function updateMetrics() {
                elements.incomingRate.textContent = state.incomingRate;
                elements.processedRate.textContent = state.processedRate;
                elements.errorRate.textContent = state.errorRate.toFixed(1) + '%';
                elements.avgLatency.textContent = state.avgLatency + 'ms';
                
                const incomingDiff = state.incomingRate - state.processedRate;
                const incomingChange = document.querySelector('#incoming-rate + span');
                const processedChange = document.querySelector('#processed-rate + span');
                
                if (incomingDiff > 20) {
                    incomingChange.className = 'text-amber-500 text-sm mb-1';
                    incomingChange.textContent = `+${incomingDiff}/sec`;
                } else if (incomingDiff < -10) {
                    incomingChange.className = 'text-green-500 text-sm mb-1';
                    incomingChange.textContent = `${incomingDiff}/sec`;
                } else {
                    incomingChange.className = 'text-gray-500 text-sm mb-1';
                    incomingChange.textContent = 'stable';
                }
                
                if (state.errorRate > 1) {
                    elements.errorRate.nextElementSibling.className = 'text-red-500 text-sm mb-1';
                    elements.errorRate.nextElementSibling.textContent = `${Math.floor(state.errorRate * state.processedRate / 100)} in last min`;
                }
                
                if (state.avgLatency > 180) {
                    elements.avgLatency.nextElementSibling.className = 'text-red-500 text-sm mb-1';
                    elements.avgLatency.nextElementSibling.textContent = 'above SLA';
                }
            }

            function updateRateChart() {
                if (!state.chartsInitialized) return;
                
                const rateIncoming = elements.rateChart.data.datasets[0].data;
                const rateProcessed = elements.rateChart.data.datasets[1].data;
                
                rateIncoming.shift();
                rateIncoming.push(state.incomingRate);
                
                rateProcessed.shift();
                rateProcessed.push(state.processedRate);
                
                elements.rateChart.update();
            }

            function updateErrorChart() {
                if (!state.chartsInitialized) return;
                
                const errorCounts = {
                    validation: 0,
                    api: 0,
                    timeout: 0,
                    database: 0
                };
                
                state.errors.forEach(error => {
                    if (errorCounts.hasOwnProperty(error.type)) {
                        errorCounts[error.type]++;
                    }
                });
                
                elements.errorChart.data.datasets[0].data = [
                    errorCounts.validation,
                    errorCounts.api,
                    errorCounts.timeout,
                    errorCounts.database
                ];
                
                elements.errorChart.update();
            }

            function filterErrors() {
                state.filteredErrors = state.errors.filter(error => {
                    const matchesSearch = state.searchTerm === '' || 
                        error.id.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
                        error.applicant.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
                        error.details.toLowerCase().includes(state.searchTerm.toLowerCase());
                    
                    const matchesType = state.errorTypeFilter === '' || 
                        error.type === state.errorTypeFilter;
                    
                    const now = new Date();
                    const errorTime = new Date(error.timestamp);
                    let timeframeMinutes;
                    
                    switch (state.timeframeFilter) {
                        case '5m': timeframeMinutes = 5; break;
                        case '15m': timeframeMinutes = 15; break;
                        case '1h': timeframeMinutes = 60; break;
                        case '24h': timeframeMinutes = 1440; break;
                        default: timeframeMinutes = 5;
                    }
                    
                    const matchesTimeframe = (now - errorTime) <= timeframeMinutes * 60 * 1000;
                    
                    return matchesSearch && matchesType && matchesTimeframe;
                });
            }

            function renderErrorLogs() {
                elements.errorLogsBody.innerHTML = '';
                
                const startIdx = (state.currentPage - 1) * state.itemsPerPage;
                const endIdx = Math.min(startIdx + state.itemsPerPage, state.filteredErrors.length);
                const visibleErrors = state.filteredErrors.slice(startIdx, endIdx);
                
                if (visibleErrors.length === 0) {
                    const row = document.createElement('tr');
                    row.className = 'text-center py-4';
                    
                    const cell = document.createElement('td');
                    cell.colSpan = 6;
                    cell.className = 'px-6 py-4 text-gray-500';
                    cell.textContent = 'No errors match the current filters';
                    
                    row.appendChild(cell);
                    elements.errorLogsBody.appendChild(row);
                    return;
                }
                
                visibleErrors.forEach(error => {
                    const row = document.createElement('tr');
                    row.className = 'error-row hover:bg-gray-50 transition-colors';
                    
                    // Timestamp
                    const timestampCell = document.createElement('td');
                    timestampCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                    timestampCell.textContent = new Date(error.timestamp).toLocaleTimeString();
                    row.appendChild(timestampCell);
                    
                    // Application ID
                    const idCell = document.createElement('td');
                    idCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900';
                    idCell.textContent = error.id;
                    row.appendChild(idCell);
                    
                    // Applicant
                    const applicantCell = document.createElement('td');
                    applicantCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    applicantCell.textContent = error.applicant;
                    row.appendChild(applicantCell);
                    
                    // Error Type
                    const typeCell = document.createElement('td');
                    typeCell.className = 'px-6 py-4 whitespace-nowrap';
                    
                    const typeBadge = document.createElement('span');
                    typeBadge.className = 'px-2 py-1 text-xs rounded-full capitalize';
                    
                    // Style based on error type
                    switch(error.type) {
                        case 'validation':
                            typeBadge.className += ' bg-red-100 text-red-800';
                            typeBadge.textContent = 'Validation';
                            break;
                        case 'api':
                            typeBadge.className += ' bg-orange-100 text-orange-800';
                            typeBadge.textContent = 'API Failure';
                            break;
                        case 'timeout':
                            typeBadge.className += ' bg-yellow-100 text-yellow-800';
                            typeBadge.textContent = 'Timeout';
                            break;
                        case 'database':
                            typeBadge.className += ' bg-teal-100 text-teal-800';
                            typeBadge.textContent = 'Database';
                            break;
                        default:
                            typeBadge.className += ' bg-gray-100 text-gray-800';
                            typeBadge.textContent = error.type;
                    }
                    
                    typeCell.appendChild(typeBadge);
                    row.appendChild(typeCell);
                    
                    // Details
                    const detailsCell = document.createElement('td');
                    detailsCell.className = 'px-6 py-4 text-sm text-gray-500';
                    detailsCell.textContent = error.details;
                    row.appendChild(detailsCell);
                    
                    // Actions
                    const actionsCell = document.createElement('td');
                    actionsCell.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium';
                    
                    const retryBtn = document.createElement('button');
                    retryBtn.className = 'text-indigo-600 hover:text-indigo-900 mr-3';
                    retryBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" /></svg>';
                    retryBtn.title = 'Retry this record';
                    retryBtn.addEventListener('click', () => retrySingleRecord(error.id));
                    
                    const flagBtn = document.createElement('button');
                    flagBtn.className = 'text-amber-600 hover:text-amber-900';
                    flagBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" /></svg>';
                    flagBtn.title = 'Flag for review';
                    
                    actionsCell.appendChild(retryBtn);
                    actionsCell.appendChild(flagBtn);
                    row.appendChild(actionsCell);
                    
                    elements.errorLogsBody.appendChild(row);
                });
                
                // Update pagination info
                elements.currentCount.textContent = `${startIdx + 1}-${endIdx}`;
                elements.totalCount.textContent = state.filteredErrors.length;
                
                elements.prevPage.disabled = state.currentPage === 1;
                elements.nextPage.disabled = endIdx >= state.filteredErrors.length;
            }
            function toggleProcessing() {
                state.processing = !state.processing;
                elements.pauseBtn.textContent = state.processing ? 'Pause Processing' : 'Resume Processing';
                
                if (state.processing) {
                    elements.pauseBtn.classList.remove('bg-gray-600');
                    elements.pauseBtn.classList.add('bg-indigo-700');
                } else {
                    elements.pauseBtn.classList.remove('bg-indigo-700');
                    elements.pauseBtn.classList.add('bg-gray-600');
                    
                    // Gradually reduce rates when paused
                    const reduceRates = () => {
                        state.incomingRate = Math.max(state.incomingRate - 10, 0);
                        state.processedRate = Math.max(state.processedRate - 10, 0);
                        updateMetrics();
                        
                        if (state.incomingRate > 0 || state.processedRate > 0) {
                            setTimeout(reduceRates, 200);
                        }
                    };
                    
                    reduceRates();
                }
            }

            // Handle search input
            function handleSearch(e) {
                state.searchTerm = e.target.value;
                state.currentPage = 1;
                filterErrors();
                renderErrorLogs();
            }

            // Handle filter changes
            function handleFilterChange() {
                state.errorTypeFilter = elements.errorTypeFilter.value;
                state.timeframeFilter = elements.timeframeFilter.value;
                state.currentPage = 1;
                filterErrors();
                renderErrorLogs();
            }

            // Go to previous page
            function goToPrevPage() {
                if (state.currentPage > 1) {
                    state.currentPage--;
                    renderErrorLogs();
                }
            }

            // Go to next page
            function goToNextPage() {
                const totalPages = Math.ceil(state.filteredErrors.length / state.itemsPerPage);
                if (state.currentPage < totalPages) {
                    state.currentPage++;
                    renderErrorLogs();
                }
            }

            // Retry failed records
            function retryFailedRecords() {
                const failedRecords = state.errors.filter(e => e.status === 'open');
                const batchSize = state.batchSize;
                
                alert(`Preparing to retry ${Math.min(failedRecords.length, batchSize)} records with ${state.retryStrategy} strategy...`);
                
                // Simulate retry processing
                setTimeout(() => {
                    for (let i = 0; i < Math.min(failedRecords.length, batchSize); i++) {
                        failedRecords[i].status = 'retrying';
                    }
                    
                    setTimeout(() => {
                        for (let i = 0; i < Math.min(failedRecords.length, batchSize); i++) {
                            if (Math.random() > 0.3) { // 70% success rate
                                failedRecords[i].status = 'retry-success';
                            } else {
                                failedRecords[i].status = 'retry-failed';
                            }
                        }
                        
                        filterErrors();
                        renderErrorLogs();
                    }, 3000);
                }, 500);
            }

            // Retry single record
            function retrySingleRecord(id) {
                const record = state.errors.find(e => e.id === id);
                if (record) {
                    record.status = 'retrying';
                    renderErrorLogs();
                    
                    setTimeout(() => {
                        record.status = Math.random() > 0.3 ? 'retry-success' : 'retry-failed';
                        renderErrorLogs();
                    }, 1500);
                }
            }

            // Update batch size
            function updateBatchSize() {
                state.batchSize = parseInt(elements.batchSize.value);
            }

            // Update retry strategy
            function updateRetryStrategy(e) {
                state.retryStrategy = e.target.value;
            }

            // Simulate connection issues
            function simulateConnectionIssues() {
                if (Math.random() < 0.02) { // 2% chance of connection issue
                    state.connection = false;
                    
                    elements.connectionStatus.innerHTML = `
                        <div class="connection-status-animate w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Disconnected - attempting to reconnect</span>
                    `;
                    
                    // Simulate reconnection
                    setTimeout(() => {
                        state.connection = true;
                        elements.connectionStatus.innerHTML = `
                            <div class="connection-status-animate w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Reconnected</span>
                        `;
                    }, 3000 + Math.random() * 5000);
                } else {
                    setTimeout(simulateConnectionIssues, 10000);
                }
            }

            // Initialize
            initializeCharts();
            simulateProcessing();
            simulateConnectionIssues();
            
            // Start with some example errors
            for (let i = 0; i < 15; i++) {
                generateErrors();
            }
            
            filterErrors();
            renderErrorLogs();
        });