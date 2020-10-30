export function getHtml(
  data: Array<{
    file: string;
    scores: Array<{ id: string; score: number }>;
  }>
) {
  return `<html>
  <head>
    <style>
      img {
        max-height: 200px;
        display: inline-block;
      }
      img.top {
        outline: 2px solid red;
      }
      span {
        display: block;
        text-align: center;
      }
      table {
        margin: 0 auto;
        border-spacing: 0;
        border-collapse: separate;
      }
      thead {
        position: sticky;
        top: 0;
      }
      th {
        background: #eee;
        vertical-align: middle;
        text-align: center;
        border-bottom: 1px solid #ccc;
        padding: 20px 0;
      }
      td {
        vertical-align: middle;
        text-align: center;
        border-bottom: 1px solid #ccc;
        padding: 20px 10px;
      }
      th:first-child,
      td:first-child {
        padding-left: 80px;
      }
      th:last-child,
      td:last-child {
        padding-right: 80px;
      }
    </style>
  </head>
  <body>
    <table>
      <tbody>
${data
  .map(({ file, scores }) => {
    const topId = scores.slice().sort((a, b) => {
      return b.score - a.score;
    })[0].id;

    return `        <tr>
          <td><img src="input/${file}" /></td>
${scores
  .map(
    (score) =>
      `          <td><img src="output-${score.id}/${file}" ${
        score.id === topId ? 'class="top" ' : ''
      }/><span>${score.score}</span></td>
`
  )
  .join('')}        </tr>
`;
  })
  .join('')}      </tbody>
      <thead>
        <tr>
          <th>Original</th>
          <th>Center-Crop</th>
          <th>Smart-Crop</th>
          <th>Smart-Crop (Thirds)</th>
        </tr>
    </table>
  </body>
</html>
`;
}
