// App-level JS: toggles sidebar and provides demo dashboard data if server doesn't provide it.
(function(){
    document.getElementById('sidebarToggle')?.addEventListener('click', ()=>{
        document.getElementById('wrapper').classList.toggle('toggled');
    });

    // Demo dashboard data — in future replaced by an API call to /analytics/dashboard-data
    window.__dashboardData = {
        todayMinutes: 65,
        focusScore: 78,
        streakDays: 5,
        burnout: 'Low',
        week: { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], data: [40,50,60,30,70,20,10] },
        subjects: { labels: ['Math','Physics','Chemistry'], data: [180,120,90] },
        heat: [1,2,3,4,2,1,0]
    };
})();
