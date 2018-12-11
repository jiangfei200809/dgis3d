package dgis.threed.service;

import Service.SqliteService;
import dgis.threed.common.Config;
import dgis.threed.model.Scene;

import java.util.List;

public class SceneService {
    private static SceneService _sceneService;

    private SqliteService _sqliteService = SqliteService.GetInstance(Config.SqliteDbPath);

    public static SceneService GetInstance() {
        if (_sceneService == null)
            _sceneService = new SceneService();

        return _sceneService;
    }

    public Scene GetById(String id) {
        String sql = "select * from Scene where Uid='" + id + "'";
        try {
            List<Scene> items = _sqliteService.Query(sql, Scene.class);

            if(items.size()>0)
                return items.get(0);
            else
                return null;
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    public boolean Add(Scene item) {
        try {
            return _sqliteService.Add(item, "Id", Scene.class);
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    public boolean Update(Scene item) {
        try {
            return _sqliteService.Update(item, "uid", item.getUid(),Scene.class);
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    public boolean Del(String id) {
        try {
            String sql = "delete from Scene where uid='" + id + "'";
            return _sqliteService.Del(sql);
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }
}
