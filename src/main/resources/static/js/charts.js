// Fill charts with sample/dynamic data. Reads data from window.__dashboardData if available.
(function(){
    function createLineChart(ctx, labels, data){
        return new Chart(ctx, {
            type: 'line',
            data: { labels, datasets: [{ label: 'Minutes', data, borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.1)', tension: 0.3 }] },
            options: { responsive: true }
        });
    }

    function createBarChart(ctx, labels, data){
        return new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Minutes', data, backgroundColor: '#198754' }] },
            options: { responsive: true }
        });
    }

    window.initCharts = function(dashboardData){
        try{
            const lineCtx = document.getElementById('lineChart');
            const barCtx = document.getElementById('barChart');

            const days = dashboardData?.week?.labels || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
            const minutes = dashboardData?.week?.data || [30,45,60,20,50,10,0];

            if(lineCtx) createLineChart(lineCtx, days, minutes);
            const subjects = dashboardData?.subjects?.labels || ['Math','Physics','Chemistry'];
            const subjData = dashboardData?.subjects?.data || [120,90,60];
            if(barCtx) createBarChart(barCtx, subjects, subjData);

            // Populate KPIs
            document.getElementById('today-minutes').textContent = (dashboardData?.todayMinutes || 50) + ' min';
            document.getElementById('focus-score').textContent = dashboardData?.focusScore || 75;
            document.getElementById('streak').textContent = (dashboardData?.streakDays || 3) + ' days';
            document.getElementById('burnout-status').textContent = dashboardData?.burnout || 'Low';

            // Heatmap simple renderer
            const heatmapEl = document.getElementById('heatmapGrid');
            if(heatmapEl){
                heatmapEl.innerHTML = '';
                const heat = dashboardData?.heat || [0,1,2,3,4,2,1];
                for(let i=0;i<21;i++){
                    const idx = i % heat.length;
                    const cell = document.createElement('div');
                    cell.className = 'heat-cell';
                    const intensity = heat[idx];
                    cell.style.background = `rgba(13,110,253,${0.05 + intensity*0.18})`;
                    cell.title = `Day ${i+1}: ${heat[idx]} hrs`;
                    heatmapEl.appendChild(cell);
                }
            }
        }catch(e){
            console.error('Chart init failed', e);
        }
    }

    // Auto init if data present
    document.addEventListener('DOMContentLoaded', ()=>{
        if(window.__dashboardData) initCharts(window.__dashboardData);
        else initCharts(null);
    });
})();
