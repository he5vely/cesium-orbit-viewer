<template>
  <div :class="['help-drawer', { open: open }]">
    <button class="help-toggle" @click="open = !open" :title="open ? '关闭' : '这是什么？'">
      {{ open ? '✕' : '?' }}
    </button>
    <div class="help-content" v-show="open">
      <h3>卫星轨道可视化系统</h3>
      <p>这是一个在 3D 地球上实时展示人造卫星运行轨迹的工具。</p>

      <h4>三种模式</h4>
      <dl>
        <dt>轨道根数 <span class="tag default">默认</span></dt>
        <dd>通过调节卫星轨道的高度、角度、形状等参数来生成轨道。就像调整一个呼啦圈的大小、倾斜度和旋转方向。</dd>

        <dt>状态向量</dt>
        <dd>输入卫星在某一时刻的位置和速度，系统自动推算出它接下来的运动轨迹。就像知道一辆车当前在哪儿、往哪开、开多快，就能算出它后面的路线。</dd>

        <dt>星历参数</dt>
        <dd>加载真实 GPS 卫星的轨道数据文件，展示真实卫星的运行轨道。卫星会定期向地面发送自己的轨道信息（星历），本系统可以解读这些数据。</dd>
      </dl>

      <h4>常见术语</h4>
      <dl>
        <dt>ECEF</dt>
        <dd>地心地固坐标系 — 以地球中心为原点、随地球一起转动的参考系。地图和 GPS 都基于这个框架。</dd>

        <dt>BLH</dt>
        <dd>经纬度 + 高度 — 就是我们日常说的"北纬多少度、东经多少度、海拔多高"。</dd>

        <dt>J2000</dt>
        <dd>惯性坐标系 — 以太阳为参考、不随地球转动的"静止"坐标系。用来做物理计算。</dd>

        <dt>半长轴 (a)</dt>
        <dd>轨道椭圆的一半长度，决定了卫星飞多高。越大飞得越高。</dd>

        <dt>偏心率 (e)</dt>
        <dd>轨道的"圆度"。0 是正圆，越大越扁。</dd>

        <dt>倾角 (i)</dt>
        <dd>轨道面与赤道面的夹角。0° 是赤道上空，90° 是极地轨道。</dd>

        <dt>升交点赤经 (Ω)</dt>
        <dd>轨道从南半球穿到北半球的那个点在哪里。决定轨道在东西方向上的位置。</dd>

        <dt>TLE</dt>
        <dd>两行轨道根数 — 一种国际通用的卫星轨道数据格式，两行文本就能描述一颗卫星的完整轨道。</dd>

        <dt>星历</dt>
        <dd>卫星当前和未来一段时间的位置预报数据。GPS 卫星靠这个让地面设备知道它们在哪。</dd>

        <dt>SP3</dt>
        <dd>精密星历格式 — 比广播星历精度更高的轨道数据，用于科研和精密定位。</dd>
      </dl>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>

<style scoped>
.help-drawer {
  position: absolute; top: 10px; right: 10px;
  width: 300px; max-height: calc(100vh - 20px);
  background: rgba(12, 12, 40, 0.93); color: #ddd;
  border: 1px solid #444; border-radius: 10px; z-index: 10;
  transition: width 0.3s ease, height 0.3s ease; overflow: hidden;
  display: flex; flex-direction: row-reverse;
  pointer-events: none;
}
.help-drawer.open {
  bottom: 10px;
}
.help-drawer:not(.open) {
  width: 40px; height: 40px;
  border: none; background: none;
  overflow: visible;
}
.help-toggle {
  position: absolute; top: 6px; right: 6px;
  width: 28px; height: 28px; border-radius: 50%;
  background: #0055aa; color: #fff; border: none;
  font-size: 14px; font-weight: bold; cursor: pointer;
  z-index: 2; flex-shrink: 0; min-height: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: auto;
}
.help-toggle:hover { background: #0077cc; }
.help-content {
  flex: 1; overflow-y: auto; padding: 16px 16px 16px 12px;
  font-size: 12px; line-height: 1.7;
}
.help-content::-webkit-scrollbar { width: 3px; }
.help-content::-webkit-scrollbar-thumb { background: #555; border-radius: 2px; }
.help-content h3 { color: #0ff; font-size: 15px; margin-bottom: 8px; }
.help-content h4 { color: #fc0; font-size: 13px; margin: 14px 0 6px; border-bottom: 1px solid #333; padding-bottom: 4px; }
.help-content p { margin: 6px 0; color: #bbb; }
.help-content dt { color: #0dd; font-weight: bold; margin-top: 8px; font-size: 12px; }
.help-content dd { color: #aaa; margin: 2px 0 8px 8px; }
.tag {
  font-size: 10px; padding: 1px 6px; border-radius: 3px;
  background: #0055aa; color: #fff; margin-left: 4px;
}

@media (max-width: 768px) {
  .help-drawer {
    top: auto; bottom: 8px; right: 8px;
    width: auto; max-height: 50vh;
  }
  .help-drawer:not(.open) {
    width: 40px;
    height: 40px;
    bottom: 56px;
  }
  .help-content { max-height: 40vh; }
}
</style>
