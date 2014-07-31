<!-- REWRITE of sightings page -->
<section id="sightings" data-role="page" data-title="Sightings">
    
    <div role="main" class="ui-content">
        <div id="start_new_sighting">
            <button id="sighting_time" data-inline="true" data-icon="plus">Start Sighting</button>
        </div>
        <!-- end start_new_sighting -->

        <div id="sighting_detail">

            <!-- // start time -->
            <div class="start_time">
                <h4>Start Time</h4>
                <p>{{start_time}}</p>
                <!-- show input form on edit -->
                <p><a href="#" class="edit_sighting_start ui-btn ui-nodisc-icon ui-btn-b ui-corner-all ui-icon-edit ui-btn-icon-notext ui-btn-inline">edit</a></p>
                <!-- hidden by default -->
                <div id="sighting_start_input" class="time_input"> 
                    <input id="start_time" type="time" value="{{start_time}}" />
                </div>
            </div>
            
            <!-- // elapsed time: if sighting is in progress -->

            <div class="elapsed_time">
                <p>{{hr}}:{{min}}:{{sec}}</p> <!-- live update (are secs needed?) -->
            </div>

            <!-- // end time if sighting is complete -->  
            <div class="end_time">
                <h4>End Time</h4>
                <p>{{end_time}}</p>
                <!-- show input form on edit -->
                <p><a href="#" class="edit_sighting_end ui-btn ui-nodisc-icon ui-btn-b ui-corner-all ui-icon-edit ui-btn-icon-notext ui-btn-inline">edit</a></p>
                <!-- hidden by default -->
                <div id="sighting_end_input" class="time_input"> 
                    <input id="end_time" type="time" value="{{end_time}}" />
                </div>
            </div>

            <!-- // stop button -->
            <button id="sighting_timer" data-inline="true" data-icon="stop">End Sighting</button>

            <!-- 
                 //                             //
                // census input section here   //
               //                             //
            -->

            <!-- // phenotypes for this sighting-->
            <a href="#pheno_obs" id="add_pheno_btn" data-rel="popup" 
        data-role="button" data-icon="plus" data-theme="b" data-inline="true">Add Phenotype</a>
            <div id="pheno_obs_records">
                <h4>Phenotypes Recorded</h4>
                <ul data-role="listview"></ul>
            </div>

            <!-- // notes -->
            <div id="sighting_notes_wrap">
                <label for="sighting_notes">Sighting Notes</label>
                <textarea cols="40" rows="6" name="sighting_notes" id="sighting_notes"></textarea>
            </div> <!--end sighting_notes_wrap -->


        </div> <!-- end sighting detail -->

        <!-- phenotype details pop-up -->
        <div id= "pheno_obs" data-role="popup">
            <a href="#" data-rel="back" class="ui-btn ui-btn-b ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a>
            <h2>Phenotype observation</h2>
            <label for="phenotype_select">Phenotype</label>
            <select id="phenotype_select"></select>
            <input type="text" id="new_phenotype" />
            <label for="frequency_slider">Frequency</label>
            <input id="frequency_slider" type="range" min="0" max="100" value="50" />
            <br/>

            <label for="pheno_notes">Phenotype Notes</label>
            <textarea cols="40" rows="6" name="pheno_notes" id="pheno_notes"></textarea>
            <a id="save_pheno_obs" data-role="button" data-rel="back" data-inline="true">Save</a> 
            
        </div><!-- end pheno_obs -->
      
    </div> <!-- /main -->
    
</section>