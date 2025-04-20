SELECT user_register_manual(
    'new_user_login',              
    'c4f5d360cb05ca868d4be1adb24f2d7239a33fc3a2b4a7d6f7b08c61e6431f59',   
    'user@example.com',          
    'Иван',                      
    'Иванов',                     
    'Иванович',                   
    0                             
);


select user_register(
    '1e4bd3db-57e9-44c0-9154-cb9476412fd8',  
    'elena_smirnova',                        
    'c4f5d360cb05ca868d4be1adb24f2d7239a33fc3a2b4a7d6f7b08c61e6431f59',                  
    'elena.smirnova@example.com',             
    'Елена',                                  
    'Смирнова',                              
    'Евгеньевна'                             
);

select user_register(
    '1e4bd3db-57e9-44c0-9154-cb9476412fd8',  
    'ivan_petrov',                            
    'c4f5d360cb05ca868d4be1adb24f2d7239a33fc3a2b4a7d6f7b08c61e6431f59',                   
    'ivan.petrov@example.com',                
    'Иван',                                   
    'Петров',                                
    'Иванович'                                
);



select write_user_stat('e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25', '2025-02-13T21:00:00.000Z'::timestamptz, '{
   "date": 1739480400,
   "time_stat":{
      "9":  {
        "timestamp_start": 32950,
        "success": true,
        "in_time": false,
        "tap_count": [10,18]
      },
      "14":  {
        "timestamp_start": 	50950,
        "success": true,
        "in_time": false,
        "tap_count": [10,18]
      }
     ,
      "19":  {
        "timestamp_start": 68400,
        "success": false,
        "in_time": true,
        "tap_count": [10,19]
      }
   }  
}');


select write_user_stat('e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25', '2025-02-14T21:00:00.000Z'::timestamptz, '{
   "date": 1739566800,
   "time_stat":{
      "9":  {
        "timestamp_start": 32950,
        "success": true,
        "in_time": false,
        "tap_count": [10,18]
      },
      "14":  {
        "timestamp_start": 50950,
        "success": true,
        "in_time": false,
        "tap_count": [10,18]
      }
     ,
      "19":  {
        "timestamp_start": 68400,
        "success": false,
        "in_time": true,
        "tap_count": [10,19]
      }
   }  
}');







select write_user_stat('50a43349-8a9e-4a37-8137-dfb01f26ae6a', '2025-02-13T21:00:00.000Z'::timestamptz, '{
   "date": 1739480400,
   "time_stat":{
      "9":  {
        "timestamp_start": 32950,
        "success": true,
        "in_time": false,
        "tap_count": 10
      },
      "14":  {
        "timestamp_start": 50950,
        "success": true,
        "in_time": false,
        "tap_count": 10
      }
     ,
      "19":  {
        "timestamp_start": 68400,
        "success": false,
        "in_time": true,
        "tap_count": 9
      }
   }  
}');


select write_user_stat('50a43349-8a9e-4a37-8137-dfb01f26ae6a', '2025-02-14T21:00:00.000Z'::timestamptz, '{
   "date": 1739566800,
   "time_stat":{
      "9":  {
        "timestamp_start": 32400,
        "success": true,
        "in_time": false,
        "tap_count": 10
      },
      "14":  {
        "timestamp_start": 50400,
        "success": true,
        "in_time": false,
        "tap_count": 10
      }
     ,
      "19":  {
        "timestamp_start": 68400,
        "success": false,
        "in_time": true,
        "tap_count": 9
      }
   }  
}');
