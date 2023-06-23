import { AfterViewInit, Component, ViewChild } from '@angular/core';
import Draw from 'ol/interaction/Draw.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import {
  Modify
} from 'ol/interaction.js';
import { ToastrService } from 'ngx-toastr';
import { getCenter } from 'ol/extent';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'sinectaMaps';
  draw: any; // global so we can remove it later
  map: any;
  source: any;
  type: any = 'Polygon';

  points: any[] = []
  @ViewChild('typeSelect') typeSelect: any;

  selected = new Style({
    fill: new Fill({
      color: '#eeeeee',
    }),
    stroke: new Stroke({
      color: 'rgba(255, 255, 255, 0.7)',
      width: 2,
    }),
  });
  pointSelected: any;
  pointToSave: any;

  search: any;
  pointsList: any[] = [];
  modify: Modify | undefined;
  editingPoint: any;

  constructor(private toastr: ToastrService) { }

  ngAfterViewInit(): void {
    const raster = new TileLayer({
      source: new OSM(),
    });
    this.source = new VectorSource({ wrapX: false });

    const vector = new VectorLayer({
      source: this.source,
    });


    this.map = new Map({
      layers: [raster, vector],
      target: 'map',
      view: new View({
        center: [-10994687.478391023, 2169223.559213179],
        zoom: 6,
      }),
    });
  }

  getSelectedFeature(): any {
    [this.pointSelected?.feature]
  }

  searching() {
    if (this.search) {
      this.pointsList = this.points.filter((x: any) => x.name.toLowerCase().includes(this.search.toLowerCase()));
    } else {
      this.pointsList = this.points;
    }
  }

  drawEnd($event: any, points: any[]) {
    const tmpPoint = { name: 'New Field', feature: $event.feature };
    points.push(tmpPoint);
    this.pointToSave = tmpPoint;
    console.log('drawend', $event)
    this.removeDrawInteraction();
  }

  addDrawInteraction() {
    if (!this.draw) {
      this.toastr.info('Lets start to draw into map', 'Draw mode')
      this.search = null;
      const value = this.type;
      if (value !== 'None') {
        this.draw = new Draw({
          source: this.source,
          type: this.type
        });
        this.draw.on('drawend', ($event: any) => {
          this.drawEnd($event, this.points)
        });
        this.map.addInteraction(this.draw);
      }
    }

  }


  editFeature(point: any, index: number) {
    console.log(point)
    let ext = point.feature.getGeometry().getExtent();
    this.map.getView().fit(ext, { size: this.map.getSize() });
    this.map.getView().setZoom(this.map.getView().getZoom() - 1)
  }

  removeDrawInteraction() {
    this.map.removeInteraction(this.draw);
    this.draw = null;
  }

  saveFeature(point: any, index: number) {
    if (this.pointToSave) {
      this.pointToSave = null;
    }
  }

  selectFeature(point: any, index: number) {
    console.log('point', point);
    if (this.pointSelected) {
      this.pointSelected.feature.setStyle(null);
    }
    point.feature.setStyle(this.selected)
    this.pointSelected = point;

  }


  addModifyInteraction(point: any, index: number) {
    this.editingPoint = point;
    this.toastr.info('Now you can modify polygon, should drag it and drop', 'Edit Mode')
    this.selectFeature(point, index);
    if (this.modify) {
      this.map.removeInteraction(this.modify);
      this.modify = undefined;
    }
    const modifySource = new VectorSource({ wrapX: false, features: this.source.getFeatures().filter((x: any) => x == this.pointSelected.feature) });
    this.modify = new Modify({
      source: modifySource
    });
    this.map.addInteraction(this.modify)
  }
  save(point: any, index: number) {
    this.editingPoint = undefined;
    if (this.modify) {
      this.map.removeInteraction(this.modify);
      this.modify = undefined;
    }
    this.toastr.success('Polygon saved','Success');
  }

  deleteFeature(point: any, index: number) {
    console.log('points', this.points);
    console.log('point', point);
    console.log('source', this.source);
    this.source.removeFeature(point.feature);
    this.points.splice(index, 1);
    this.searching();
  }

  // changeTypeSelect() {
  //   debugger;
  //   this.map.removeInteraction(this.draw);
  //   this.addInteraction();
  // };

  // delete() {
  //   this.draw.removeLastPoint();
  // }
}

