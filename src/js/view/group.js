export default L.MultiPolygon.extend({
  initialize (latlngs, options) {
    L.MultiPolygon.prototype.initialize.call(this, latlngs, options);

    this.on('layeradd', (e) => {
      var mViewStyle = this._map.options.style.view;
      e.target.setStyle($.extend({
        opacity: 0.7,
        fillOpacity: 0.35,
        color: '#00ABFF'
      }, mViewStyle));

      this._map._moveEPolygonOnTop();
    });
  },
  isEmpty() {
    return this.getLayers().length === 0;
  },
  onAdd (map) {
    L.MultiPolygon.prototype.onAdd.call(this, map);

    this.on('mousemove', (e) => {
      var eMarkersGroup = map.getEMarkersGroup();
      if (eMarkersGroup.isEmpty()) {
        map.fire('editor:view_polygon_mousemove', { layerPoint: e.layerPoint });
      } else {
        if (!eMarkersGroup.getFirst()._hasFirstIcon()) {
          map.fire('editor:view_polygon_mousemove', { layerPoint: e.layerPoint });
        }
      }
    });
    this.on('mouseout', () => {
      var eMarkersGroup = map.getEMarkersGroup();
      if (eMarkersGroup.isEmpty()) {
        map.fire('editor:view_polygon_mouseout');
      } else {
        if (!eMarkersGroup.getFirst()._hasFirstIcon()) {
          map.fire('editor:view_polygon_mouseout');
        }
      }
    });
  },
  onClick (e) {
    var map = this._map;
    var selectedMGroup = map.getSelectedMGroup();
    var eMarkersGroup = map.getEMarkersGroup();
    if ((eMarkersGroup.getFirst() && eMarkersGroup.getFirst()._hasFirstIcon() && !eMarkersGroup.isEmpty()) ||
      (selectedMGroup && selectedMGroup.getFirst() && selectedMGroup.getFirst()._hasFirstIcon() && !selectedMGroup.isEmpty())) {
      var eMarkersGroup = map.getEMarkersGroup();
      eMarkersGroup.set(e.latlng);
      map._convertToEdit(eMarkersGroup);
    } else {
      // reset
      if (map._getSelectedVLayer()) {
        map._setEPolygon_To_VGroup();
      } else {
        map._addEPolygon_To_VGroup();
      }
      map.clear();
      map.mode('draw');

      map._hideSelectedVLayer(e.layer);

      eMarkersGroup.restore(e.layer);
      map._convertToEdit(eMarkersGroup);

      eMarkersGroup.select();
    }
  },
  onRemove (map) {
    this.off('mouseover');
    this.off('mouseout');

    map.off('editor:view_polygon_mousemove');
    map.off('editor:view_polygon_mouseout');
  }
});